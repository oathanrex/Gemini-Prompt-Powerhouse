
import type { PromptCategory } from './types';
import { BookOpenIcon, CodeBracketIcon, BriefcaseIcon } from './components/Icons';

export const PROMPT_LIBRARY: PromptCategory[] = [
  {
    name: "Content Creation",
    icon: BookOpenIcon,
    templates: [
      {
        title: "Blog Post Outline",
        prompt: "Create a detailed blog post outline for the topic '[Your Topic]'. Include an introduction, 3-5 main sections with sub-points, and a conclusion. Suggest a catchy title and a call-to-action.",
      },
      {
        title: "Social Media Campaign",
        prompt: "Develop a 5-day social media campaign strategy for launching a new [Product/Service]. The target audience is [Target Audience]. Provide post ideas for each day, including text, visuals, and relevant hashtags for platforms like Instagram, Twitter, and LinkedIn.",
      },
      {
        title: "Video Script Hook",
        prompt: "Write 3 compelling video hooks (the first 15 seconds) for a YouTube video about '[Video Topic]'. The tone should be [engaging/informative/humorous].",
      },
    ],
  },
  {
    name: "Software Development",
    icon: CodeBracketIcon,
    templates: [
      {
        title: "Generate React Component",
        prompt: "Create a functional React component in TypeScript using Tailwind CSS for a [Component Description, e.g., 'pricing card']. It should accept the following props: [List of props like 'planName', 'price', 'features']. Include a visually appealing and modern design.",
      },
      {
        title: "Explain Code Snippet",
        prompt: "Explain the following code snippet in detail. Describe what it does, how it works, and point out any potential improvements or edge cases to consider.\n\n```[language]\n[Paste Code Here]\n```",
      },
      {
        title: "Write API Documentation",
        prompt: "Generate API documentation in Markdown format for an endpoint that does the following: '[Endpoint Functionality, e.g., 'fetches user profile data']'. Include the endpoint path, HTTP method, required request parameters, and example success and error responses in JSON.",
      },
    ],
  },
  {
    name: "Business Strategy",
    icon: BriefcaseIcon,
    templates: [
      {
        title: "SWOT Analysis",
        prompt: "Conduct a SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis for a [type of business, e.g., 'local coffee shop'] in a [market environment, e.g., 'competitive urban area']. Provide at least 3 points for each category.",
      },
      {
        title: "Elevator Pitch",
        prompt: "Craft a compelling 60-second elevator pitch for a new startup: [Startup Name], which provides [Product/Service] for [Target Customer]. The pitch should be clear, concise, and persuasive.",
      },
      {
        title: "Competitor Analysis Framework",
        prompt: "Provide a framework for analyzing a key competitor. The framework should include sections for: Company Overview, Product/Service Offering, Pricing Strategy, Marketing & Sales Channels, and Key Strengths & Weaknesses.",
      },
    ],
  },
];

export const ANALYSIS_SYSTEM_PROMPT = `
You are an expert AI prompt engineer. Your task is to analyze the user's prompt and break it down into its core components.
Do not execute the prompt. Only analyze it.
Identify and describe the following elements based on the provided prompt:
- persona: The role or character the AI is asked to assume.
- task: The primary action or goal the AI is instructed to perform.
- domain: The subject matter or field the prompt is related to.
- tone: The desired style or mood of the response.
- constraints: Any limitations or specific rules the AI must follow.
- outputFormat: The specified structure or format for the final output.
If an element is not explicitly mentioned, infer it from the context or state 'Not specified'.
`;
