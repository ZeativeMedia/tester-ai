

import { HfInference } from "@huggingface/inference"

const client = new HfInference("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")

let out = "";


const stream = await client.chatCompletion({
	model: "allenai/Llama-3.1-Tulu-3-8B",
	messages: [
		{ role: "user", content: "Kucing dan ayam" }
	],
	temperature: 0.5,
	max_tokens: 2048,
	top_p: 0.7
});

console.log(stream.choices[0].message.content)