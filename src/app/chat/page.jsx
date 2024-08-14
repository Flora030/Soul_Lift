import React, { useState } from 'react';
import axios from 'axios';

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const sendMessage = async () => {
        if (!input) return;

        const instanceId = 'your-instance-id'; // Replace with your actual instance ID
        const workspaceId = 'your-workspace-id'; // Replace with your actual workspace ID
        const apiKey = 'your-api-key'; // Replace with your actual API key

        const response = await axios.post(
            `https://api.us-south.assistant.watson.cloud.ibm.com/instances/${instanceId}/v1/workspaces/${workspaceId}/message?version=2021-06-14`,
            {
                input: { text: input }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${btoa('apikey:' + apiKey)}`
                }
            }
        );

        const botMessage = response.data.output.text[0];
        setMessages([...messages, { user: input, bot: botMessage }]);
        setInput("");
    };

    return (
        <div>
            <div>
                {messages.map((msg, index) => (
                    <div key={index}>
                        <p><strong>User:</strong> {msg.user}</p>
                        <p><strong>Bot:</strong> {msg.bot}</p>
                    </div>
                ))}
            </div>
            <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder="Type your message here..." 
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};

export default Chatbot;
