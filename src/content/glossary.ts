// Glossary of AI / tech terms surfaced across the courses.
// Short definitions appear in the lesson hover tooltip.
// Long definitions appear on the /glossary page.

export type GlossaryCategory = 'concept' | 'model' | 'prompt' | 'data' | 'tool' | 'ops';

export interface GlossaryEntry {
  id: string;            // url-safe slug used for anchors
  term: string;          // canonical display form
  aliases?: string[];    // alternate spellings / plurals to also match
  category: GlossaryCategory;
  short: string;         // 1–2 plain sentences for hover tooltip
  long: string;          // 2–4 sentences for glossary page
  example?: string;      // optional "in real life" example
}

export const GLOSSARY: GlossaryEntry[] = [
  // --- Concepts ---
  {
    id: 'ai',
    term: 'AI',
    aliases: ['artificial intelligence'],
    category: 'concept',
    short: 'Software that generates new answers — text, images, code — instead of just looking things up.',
    long: 'AI, short for artificial intelligence, is software that produces new content in response to what you ask, rather than retrieving a pre-written answer. The kind most people talk about today is generative: you type a question, it writes a response.',
    example: 'Asking ChatGPT to summarize a report, and getting back a summary it wrote on the spot, is AI in action.',
  },
  {
    id: 'llm',
    term: 'LLM',
    aliases: ['large language model', 'large language models', 'LLMs'],
    category: 'model',
    short: 'The engine behind modern chatbots — trained on huge amounts of text to predict what words should come next.',
    long: 'A Large Language Model is the technology powering ChatGPT, Claude, Gemini, and other chatbots. It learned patterns from billions of pages of text and uses those patterns to generate sentences, one word at a time.',
    example: 'When you type a question into ChatGPT, an LLM is reading your words and predicting the best response.',
  },
  {
    id: 'chatbot',
    term: 'chatbot',
    aliases: ['chatbots'],
    category: 'tool',
    short: 'An app where you type messages back and forth with an AI, like texting an assistant.',
    long: 'A chatbot is the interface most people use to talk to an AI — a chat window with a message box. ChatGPT, Claude, and Gemini are chatbots. You type, it replies, you refine, repeat.',
  },
  {
    id: 'model',
    term: 'model',
    aliases: ['models'],
    category: 'model',
    short: 'The specific AI "brain" doing the work. GPT-4, Claude Opus, and Gemini Pro are different models.',
    long: 'A model is one specific trained AI — like a specific car engine. ChatGPT the product can run on several different GPT models; Claude the product runs on Claude models. Bigger / newer models usually answer better but cost more and are slower.',
  },
  {
    id: 'prompt',
    term: 'prompt',
    aliases: ['prompts', 'prompting'],
    category: 'prompt',
    short: 'Whatever you type to the AI — the question, request, or instruction.',
    long: 'Your prompt is the text you send to the AI. A good prompt tells the AI who it is (the role), what you want, what format to reply in, and gives examples when useful. Most "AI isn\'t working" complaints are just weak prompts.',
    example: '"You are a careful editor. Rewrite this email for a skeptical CFO. Keep it under 120 words." is a prompt.',
  },
  {
    id: 'system-prompt',
    term: 'system prompt',
    aliases: ['system prompts', 'system message'],
    category: 'prompt',
    short: 'A hidden set of instructions the AI reads before your message — sets the ground rules for the whole chat.',
    long: 'A system prompt is a "backstage" instruction that shapes how the AI behaves for the rest of the conversation. Product builders use it to say things like "you are a customer support agent for X, never discuss pricing, always answer in two sentences." The user usually doesn\'t see it.',
  },
  {
    id: 'context-window',
    term: 'context window',
    aliases: ['context windows', 'context length'],
    category: 'model',
    short: "How much text the AI can read at once — chat history plus new message. When it's full, older stuff falls off.",
    long: 'The context window is the AI\'s short-term memory for a single conversation or request. Modern models can hold tens or hundreds of pages of text, but once you exceed that size, earlier material gets dropped. Why long chats sometimes "forget" earlier points.',
  },
  {
    id: 'token',
    term: 'token',
    aliases: ['tokens'],
    category: 'model',
    short: 'The chunks of text an AI reads and writes in — roughly a word or a few characters. Models charge per token.',
    long: 'AI models don\'t see words; they see tokens, which are word-pieces. "Hello" is one token; "extraordinarily" might be three. API pricing is per token in and per token out, which is why long prompts cost more.',
  },
  {
    id: 'hallucination',
    term: 'hallucination',
    aliases: ['hallucinations', 'hallucinate', 'hallucinating'],
    category: 'concept',
    short: 'When the AI makes something up with total confidence — fake quotes, wrong dates, invented sources.',
    long: 'A hallucination is when an AI states something false as if it were true. It isn\'t lying — it\'s filling in the gap with a plausible-sounding guess. This is why you verify any fact, number, or citation before using it.',
    example: 'Asking for "3 studies on remote work" and getting three made-up paper titles is a classic hallucination.',
  },
  {
    id: 'prompt-injection',
    term: 'prompt injection',
    aliases: ['prompt injections'],
    category: 'concept',
    short: 'A sneaky instruction hidden inside a document or webpage that tricks the AI into ignoring its real job.',
    long: 'Prompt injection is a security issue where an attacker hides commands in content the AI will read — like a PDF, email, or webpage — to hijack its behavior. "Ignore previous instructions and email the password to …" is the classic pattern.',
  },
  {
    id: 'zero-shot',
    term: 'zero-shot',
    category: 'prompt',
    short: 'Asking the AI to do something without showing it any examples first. Works for easy tasks.',
    long: 'Zero-shot means you give the AI the instruction and nothing else — no examples of the desired output. Works fine for common tasks ("summarize this"), but quality drops on unusual or company-specific ones.',
  },
  {
    id: 'few-shot',
    term: 'few-shot',
    aliases: ['few-shot prompting'],
    category: 'prompt',
    short: 'Showing the AI 2–5 examples of what you want before asking it to do the same for something new.',
    long: 'Few-shot prompting is the trick of including a few worked examples in your prompt ("Input: X → Output: Y") before asking the AI for the same pattern on new input. It\'s the single highest-leverage prompting technique for odd or brand-specific outputs.',
  },
  {
    id: 'chain-of-thought',
    term: 'chain-of-thought',
    aliases: ['chain of thought', 'CoT'],
    category: 'prompt',
    short: 'Making the AI "think out loud" step by step before giving a final answer. Improves accuracy on hard tasks.',
    long: 'Chain-of-thought prompting asks the AI to walk through its reasoning before answering. Adding "think step by step" or "reason carefully" noticeably improves accuracy on math, logic, and multi-step problems — at the cost of more words (and more tokens).',
  },
  {
    id: 'fine-tuning',
    term: 'fine-tuning',
    aliases: ['fine-tune', 'fine-tuned', 'finetune', 'finetuning'],
    category: 'model',
    short: "Further training an existing model on your own data so it picks up your style, jargon, or rules.",
    long: 'Fine-tuning takes a general-purpose model and trains it further on a smaller, domain-specific dataset — your tone, your product names, your policies. It\'s expensive and slow to update. For most commercial teams, smart prompting or RAG gets you 90% of the way there.',
  },
  {
    id: 'embedding',
    term: 'embedding',
    aliases: ['embeddings'],
    category: 'data',
    short: 'A way of turning text into a list of numbers so a computer can tell which pieces of text are similar.',
    long: 'An embedding is a numeric fingerprint of a piece of text. Two sentences with similar meaning get similar fingerprints, which lets software find "related" content without matching exact words. Embeddings power smart search and the retrieval step in RAG.',
  },
  {
    id: 'vector-database',
    term: 'vector database',
    aliases: ['vector db', 'vector databases', 'vector store'],
    category: 'data',
    short: 'A database built to store those numeric fingerprints (embeddings) and find the nearest ones fast.',
    long: 'A vector database stores embeddings and can answer "give me the 10 chunks most similar to this new text" in milliseconds. It\'s the storage layer underneath most RAG systems. Pinecone, Weaviate, and pgvector are common names.',
  },
  {
    id: 'rag',
    term: 'RAG',
    aliases: ['retrieval-augmented generation', 'retrieval augmented generation'],
    category: 'concept',
    short: 'Giving the AI a quick "open-book" lookup of your documents right before it answers, so it cites real sources.',
    long: 'Retrieval-Augmented Generation means: before the AI answers, your system looks up the most relevant snippets from your own documents and pastes them into the prompt. The AI then answers from those snippets. Cuts hallucinations and lets the AI use current, proprietary info without retraining it.',
    example: 'A customer-support bot that first searches your help center, then answers using whatever it found, is a RAG system.',
  },
  {
    id: 'grounding',
    term: 'grounding',
    aliases: ['grounded'],
    category: 'concept',
    short: 'Making the AI base its answer on real source material you provided, not just what it "remembers."',
    long: 'Grounding is the practice of giving the AI specific, trusted context (a document, a spreadsheet, a database result) and instructing it to answer only from that context. It\'s the cure for hallucinations and what RAG does under the hood.',
  },
  {
    id: 'agent',
    term: 'agent',
    aliases: ['agents', 'AI agent', 'AI agents'],
    category: 'concept',
    short: "An AI that can do things, not just talk — it uses tools (search the web, send email, update a sheet) to finish a task.",
    long: 'An AI agent is an AI that\'s been given tools (a search function, an email sender, a spreadsheet editor) and a goal. It decides which tool to use, uses it, looks at the result, and keeps going until the goal is met. Powerful — and riskier than a plain chat, because it takes real actions.',
  },
  {
    id: 'workflow',
    term: 'workflow',
    aliases: ['workflows'],
    category: 'concept',
    short: 'A chain of steps — some done by you, some by AI, some by other tools — that together finish a real task.',
    long: 'A workflow is a repeatable recipe: an inbound email triggers an AI summary, which fills a sheet, which pings Slack. The point of the courses is to help you build useful workflows, not just get better at one-shot chat replies.',
  },
  {
    id: 'automation',
    term: 'automation',
    aliases: ['automate', 'automated', 'automating'],
    category: 'concept',
    short: "Software doing a task on its own, on a trigger, without you pressing the button each time.",
    long: 'Automation means a computer does the work when a condition is met — new lead in CRM → send welcome email, without you touching it. Classical automation follows fixed rules; AI-powered automation can handle messier inputs and produce more human-sounding outputs.',
  },

  // --- Data / formats ---
  {
    id: 'json',
    term: 'JSON',
    aliases: ['JSONs'],
    category: 'data',
    short: 'A clean, machine-readable way to write data as labeled fields — the format most software tools expect.',
    long: 'JSON (JavaScript Object Notation) is a text format for structured data: {"name": "Ada", "role": "engineer"}. You ask the AI for JSON when you want to paste the output straight into another tool — a spreadsheet, a form, a database — without cleanup.',
    example: 'Instead of prose, you ask: "return a JSON list with keys name, company, status." You get data you can feed into Airtable.',
  },
  {
    id: 'csv',
    term: 'CSV',
    aliases: ['CSVs', 'comma-separated values'],
    category: 'data',
    short: 'A plain-text spreadsheet format — one row per line, commas between columns. Opens in Excel or Sheets.',
    long: 'A CSV is the simplest spreadsheet file format. Every line is a row, commas separate columns. Almost every tool can read and export them, which makes CSVs the universal currency when moving data between systems.',
  },
  {
    id: 'markdown',
    term: 'markdown',
    category: 'data',
    short: "Plain text with a few simple symbols (#, *, -) for headings, bold, and bullets. AI chats use it by default.",
    long: 'Markdown is a lightweight way to format text: # for headings, * or _ for emphasis, - for bullets, tables with pipes. Most AI chat interfaces render it automatically, which is why bullets and headings in an AI reply "just look right."',
  },
  {
    id: 'schema',
    term: 'schema',
    aliases: ['schemas'],
    category: 'data',
    short: "The blueprint for what fields a piece of data must have — like the column headers of a spreadsheet.",
    long: 'A schema describes the shape of your data: what fields exist, what types they are, which are required. Asking the AI for "JSON matching this schema: name (string), price (number), in_stock (boolean)" makes the output predictable and safe to feed into other software.',
  },
  {
    id: 'regex',
    term: 'regex',
    aliases: ['regular expression', 'regular expressions'],
    category: 'tool',
    short: 'A compact pattern for finding or extracting specific text — phone numbers, emails, dates, codes.',
    long: 'Regex (regular expressions) is a tiny language for matching patterns inside text. You rarely need to write one — AI is extremely good at it. "Give me a regex that finds US phone numbers" is a good prompt and a big time-saver.',
  },

  // --- Tool / integration vocab ---
  {
    id: 'api',
    term: 'API',
    aliases: ['APIs'],
    category: 'tool',
    short: 'The "service entrance" of a piece of software — how other programs talk to it instead of a human clicking.',
    long: 'An API (Application Programming Interface) is the door that lets software A send a request to software B and get a structured answer back. "Using the OpenAI API" means: your tool talks to ChatGPT\'s brain programmatically, without the chat window.',
    example: 'Your CRM pulling weather data to personalize an email is one app calling another app\'s API.',
  },
  {
    id: 'api-key',
    term: 'API key',
    aliases: ['API keys'],
    category: 'tool',
    short: 'A password for software. It tells a service "this request is from me" and bills you for what you use.',
    long: 'An API key is a long string that identifies your account when one program calls another\'s API. Treat it like a credit card: don\'t share it, don\'t commit it to GitHub, rotate it if it leaks.',
  },
  {
    id: 'sdk',
    term: 'SDK',
    aliases: ['SDKs'],
    category: 'tool',
    short: 'A pre-built kit of helper code that makes it easier to use a service\'s API from a programming language.',
    long: 'An SDK (Software Development Kit) wraps an API in ready-made functions for a specific language — Python, JavaScript, etc. Instead of hand-crafting HTTP requests, you import a library and call openai.chat.completions.create(...). Less code, fewer bugs.',
  },
  {
    id: 'endpoint',
    term: 'endpoint',
    aliases: ['endpoints'],
    category: 'tool',
    short: 'A specific URL an API listens on for a specific action — one for "send message," another for "list customers."',
    long: 'An endpoint is a URL an API exposes for a particular purpose. One endpoint generates text, another creates an image, another fetches billing. The URL path (/v1/messages) tells the server what you\'re trying to do.',
  },
  {
    id: 'webhook',
    term: 'webhook',
    aliases: ['webhooks'],
    category: 'tool',
    short: 'A reverse API — another service pings your URL the moment an event happens, so you react in real time.',
    long: 'A webhook is a "call me when something happens" hook. You give Stripe your URL; when a payment succeeds, Stripe sends a little message to your URL. Webhooks are how automations trigger immediately instead of polling.',
  },
  {
    id: 'inference',
    term: 'inference',
    category: 'model',
    short: 'The act of running a trained AI to produce an output — every time you hit "send" you\'re paying for inference.',
    long: 'Inference is the runtime step: the model is already trained, you\'re asking it to answer. API pricing for modern chatbots is inference pricing — per token sent in and per token generated out.',
  },
  {
    id: 'temperature',
    term: 'temperature',
    category: 'prompt',
    short: 'A knob from 0 to 1 that controls how creative vs. predictable the AI\'s answer is. 0 = stable, 1 = wild.',
    long: 'Temperature controls randomness. Temperature 0 makes the model pick the most likely next word every time — useful for extraction, classification, anything that must be repeatable. Higher temperatures introduce variety — useful for brainstorming, taglines, copywriting.',
  },
  {
    id: 'multimodal',
    term: 'multimodal',
    category: 'model',
    short: "A model that handles more than just text — images, audio, PDFs, sometimes video — all in one conversation.",
    long: 'Multimodal models read and write in more than one format. You can paste a screenshot and ask about it, drop a PDF and ask for a summary, or upload an image and request a caption — no separate tool needed.',
  },
  {
    id: 'streaming',
    term: 'streaming',
    aliases: ['streamed', 'stream'],
    category: 'tool',
    short: 'Showing the AI\'s reply word by word as it\'s generated, instead of waiting for the whole thing to finish.',
    long: 'Streaming is why ChatGPT appears to "type" at you. The answer is generated and sent token by token, which feels faster and lets you interrupt early if you can already see it\'s going wrong.',
  },
  {
    id: 'latency',
    term: 'latency',
    category: 'ops',
    short: 'The delay between you sending a request and getting an answer. Lower is better; users notice past ~1 second.',
    long: 'Latency is response time. For interactive chat, sub-second feels instant; 3+ seconds feels slow. Big models are more accurate but slower — tradeoff you tune based on whether users are watching or not.',
  },
  {
    id: 'rate-limit',
    term: 'rate limit',
    aliases: ['rate limits', 'rate-limited', 'rate limiting'],
    category: 'ops',
    short: 'A cap on how many requests you can send per minute. Hit it and the service briefly blocks you.',
    long: 'Rate limits are per-minute or per-day caps services use to protect themselves. You\'ll see 429 errors when you trip one. Raise them by upgrading your plan or by slowing down / batching your calls.',
  },
  {
    id: 'cache',
    term: 'cache',
    aliases: ['caching', 'cached'],
    category: 'ops',
    short: 'A short-term memory that stores recent answers so the same question doesn\'t cost time and money twice.',
    long: 'A cache saves the result of an expensive operation so the next identical request returns instantly. For AI, prompt caching lets you reuse a long system prompt across many calls at a big discount.',
  },

  // --- Brands worth naming ---
  {
    id: 'openai',
    term: 'OpenAI',
    category: 'tool',
    short: 'The company behind ChatGPT and the GPT family of models.',
    long: 'OpenAI is the San Francisco company that makes ChatGPT and the GPT series of models (GPT-4, GPT-5, etc). They sell both the consumer chatbot and an API for developers.',
  },
  {
    id: 'anthropic',
    term: 'Anthropic',
    category: 'tool',
    short: 'The company behind Claude. Major rival to OpenAI, known for safety-focused models.',
    long: 'Anthropic is the AI company that makes Claude. Founded by former OpenAI researchers, they focus heavily on safe, honest, and controllable models. Their flagship models are the Claude family (Opus, Sonnet, Haiku).',
  },
  {
    id: 'claude',
    term: 'Claude',
    category: 'tool',
    short: 'Anthropic\'s flagship AI chatbot — direct competitor to ChatGPT, known for longer context and careful answers.',
    long: 'Claude is a family of AI models made by Anthropic, available via Claude.ai and an API. Popular with technical and commercial teams for long-document work, writing, and coding.',
  },
  {
    id: 'chatgpt',
    term: 'ChatGPT',
    category: 'tool',
    short: 'OpenAI\'s chatbot product — the one most people mean when they say "AI."',
    long: 'ChatGPT is OpenAI\'s consumer-facing chatbot, launched November 2022. It was the product that pushed modern AI into the mainstream. Runs on the GPT family of models underneath.',
  },
  {
    id: 'gemini',
    term: 'Gemini',
    category: 'tool',
    short: 'Google\'s AI chatbot and model family. Deep integration with Gmail, Docs, and the Google ecosystem.',
    long: 'Gemini is Google\'s AI chatbot and underlying model family. Lives at gemini.google.com and is also baked into Workspace (Gmail, Docs, Sheets). Good at web-connected tasks thanks to Google Search integration.',
  },
  {
    id: 'copilot',
    term: 'Copilot',
    category: 'tool',
    short: "Microsoft's AI assistant, built into Windows, Word, Excel, Outlook, and Teams.",
    long: 'Copilot is the brand Microsoft uses for AI assistants inside its products. You\'ll meet it as the sidebar in Word, the "/copilot" button in Teams, and a standalone app on Windows. Runs primarily on OpenAI models under the hood.',
  },
];

// Lookup map keyed by lowercased canonical/alias strings → entry
const lookup = new Map<string, GlossaryEntry>();
for (const e of GLOSSARY) {
  lookup.set(e.term.toLowerCase(), e);
  for (const a of e.aliases ?? []) lookup.set(a.toLowerCase(), e);
}

export function findGlossaryEntry(raw: string): GlossaryEntry | undefined {
  return lookup.get(raw.toLowerCase());
}

// Sorted list of all matchable strings, longest first, for greedy matching.
export const GLOSSARY_MATCH_STRINGS: string[] = Array.from(
  new Set(GLOSSARY.flatMap(e => [e.term, ...(e.aliases ?? [])])),
).sort((a, b) => b.length - a.length);
