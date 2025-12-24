# Gemini AI Chat

A modern, feature-rich AI chatbot application powered by Google's Gemini API. Built with Next.js, React, TypeScript, and Tailwind CSS for a seamless user experience.

## 🌟 Features

- **AI-Powered Conversations**: Leverage Google's advanced Gemini models for intelligent responses
- **Real-time Chat Interface**: Smooth, responsive chat UI with message history
- **Markdown Support**: Rich text rendering with markdown support for AI responses
- **Copy to Clipboard**: Easily copy AI responses with one click
- **Error Handling**: Robust error management with user-friendly messages
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **Modern UI Components**: Beautiful, accessible UI components from Radix UI
- **Type-Safe**: Full TypeScript support for development safety

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or higher
- npm, yarn, or pnpm package manager
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KartikeySriv/gemini-chatbot.git
   cd chatbot
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   GOOGLE_API_KEY=your_gemini_api_key_here
   ```

   Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

4. **Run the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   # or
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📦 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) - React framework with server-side rendering
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **UI Components**: [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
- **AI API**: [Google Generative AI](https://ai.google.dev/) - Gemini API SDK
- **Icons**: [Lucide React](https://lucide.dev/) - Modern icon library
- **Markdown**: [React Markdown](https://www.npmjs.com/package/react-markdown) - Markdown rendering
- **Forms**: [React Hook Form](https://react-hook-form.com/) - Efficient form management
- **Database**: [Zod](https://zod.dev/) - Schema validation

## 📁 Project Structure

```
.
├── app/
│   ├── layout.tsx           # Root layout component
│   ├── page.tsx             # Main page
│   ├── globals.css          # Global styles
│   └── api/
│       └── chat/
│           └── route.ts     # Chat API endpoint
├── components/
│   ├── chat-interface.tsx   # Main chat UI component
│   ├── theme-provider.tsx   # Theme context provider
│   ├── theme-toggle.tsx     # Dark mode toggle
│   └── ui/                  # Radix UI component library
├── hooks/                   # Custom React hooks
├── lib/                     # Utility functions
├── public/                  # Static assets
├── styles/                  # Global styles
└── package.json             # Dependencies and scripts
```

## 🔧 Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint to check code quality

## 💻 Usage

1. **Start chatting**: Type your message in the input field and press Enter or click Send
2. **Copy responses**: Click the copy icon to copy any AI response to your clipboard
4. **Clear history**: Refresh the page to start a new conversation

## 🔐 Security Notes

- **API Keys**: Never commit your `.env.local` file or expose API keys in source code
- **Environment Variables**: Use environment variables for sensitive configuration
- **Rate Limiting**: Be aware of Google Gemini API rate limits and quotas
- **Input Validation**: All user inputs are validated before being sent to the API

## 🎨 Customization

### Styling

Customize colors, fonts, and spacing in:
- `tailwind.config.ts` - Tailwind configuration
- `app/globals.css` - Global styles
- Component files - Individual component styling

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add `GOOGLE_API_KEY` to environment variables in Vercel settings
4. Deploy automatically on push

### Other Platforms

The application can also be deployed to:
- **Netlify**: [Deployment guide](https://docs.netlify.com/frameworks/next-js/overview/)
- **AWS Amplify**: [Deployment guide](https://docs.amplify.aws/nextjs/start/quickstart/)
- **Docker**: Create a Dockerfile based on Next.js documentation

## 📝 API Reference

### Chat Endpoint

**POST** `/api/chat`

Request body:
```json
{
  "message": "Your message here",
  "history": [
    {
      "role": "user|assistant",
      "content": "Message content"
    }
  ]
}
```

Response:
```json
{
  "response": "AI response text",
  "error": null
}
```

## 🐛 Troubleshooting

### API Key Issues
- Verify your API key is valid and has proper permissions
- Check that `GOOGLE_API_KEY` is set in `.env.local`
- Ensure your Google Cloud project has the Generative AI API enabled

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && pnpm install`
- Check Node.js version compatibility

### Runtime Errors
- Check browser console for detailed error messages
- Review server logs for API errors
- Verify network connectivity

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/docs/primitives/overview/introduction)
- [TypeScript](https://www.typescriptlang.org/docs/)


## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues, questions, or suggestions, please open an issue on the repository.

---

**Built with ❤️ using Next.js and Google Gemini AI**
