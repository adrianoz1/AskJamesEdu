import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';

import Chat from './Chat';
import Script from 'next/script';

export default function Home() {
    library.add(fab);
    library.add(fas);
    return (
        <main className="hero min-h-screen u-center px-2">
            <div className="hero-body u-flex-column">
                <div className="space space--lg"></div>
                <h1 className="text-center text-white tracking-tight u-flex u-items-center">
                    Pergunte ao James Edu
                </h1>
                <p className="lead text-gray-300">
                    Tire suas dúvidas de inglês e aprenda todos os dias! 🚀📚🌍
                </p>
                <Chat />
            </div>

            <p className="mx-4 text-white">
                Made by{' '}
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://adrianoalmeida.dev"
                    className="text-white font-bold u u-LR"
                >
                    Adriano Almeida
                </a>
                . Powered by{' '}
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://openai.com/blog/chatgpt"
                    className="text-white font-bold u u-LR"
                >
                    ChatGPT
                </a>{' '}
                and{' '}
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://www.cirrus-ui.com/"
                    className="text-white font-bold u u-LR"
                >
                    Cirrus
                </a>
                .
            </p>
        </main>
    );
}
