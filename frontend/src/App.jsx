import { useState } from "react";

function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const handleGenerate = () => {
    setOutput("Generating content...");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Autonomous Content Factory 🚀</h1>

      <textarea
        rows="6"
        cols="60"
        placeholder="Paste your content here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <br /><br />

      <button onClick={handleGenerate}>
        Generate Content
      </button>

      <h3>Output:</h3>
      <p>{output}</p>
    </div>
  );
}

export default App;