import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# MCP-style tools the agent can use
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_system_info",
            "description": "Returns basic info about the running system/environment.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "echo_message",
            "description": "Echoes a message back — useful for testing the agent pipeline.",
            "parameters": {
                "type": "object",
                "properties": {
                    "message": {"type": "string", "description": "The message to echo"}
                },
                "required": ["message"]
            }
        }
    }
]

def handle_tool_call(tool_name: str, tool_input: dict) -> str:
    """Execute tool calls from the agent."""
    if tool_name == "get_system_info":
        return "Running inside Docker container on k3s/Kubernetes on AWS EC2."
    elif tool_name == "echo_message":
        return f"Echo: {tool_input.get('message', '')}"
    return "Unknown tool"

async def run_agent(prompt: str) -> str:
    """Run the MCP agent loop with Groq + Llama 3."""
    messages = [
        {
            "role": "system",
            "content": "You are a helpful AI agent running inside a Kubernetes cluster on AWS. You have access to tools to inspect the environment."
        },
        {
            "role": "user",
            "content": prompt
        }
    ]

    while True:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=1000,
            tools=tools,
            tool_choice="auto",
            messages=messages,
        )

        msg = response.choices[0].message

        # If the model wants to use a tool
        if msg.tool_calls:
            # Add assistant message with tool calls to history
            messages.append({
                "role": "assistant",
                "content": msg.content or "",
                "tool_calls": [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments
                        }
                    } for tc in msg.tool_calls
                ]
            })

            # Execute each tool and add results to messages
            import json
            for tc in msg.tool_calls:
                tool_input = json.loads(tc.function.arguments)
                result = handle_tool_call(tc.function.name, tool_input)
                messages.append({
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": result
                })

        else:
            # Final text response
            return msg.content or "No response from agent"