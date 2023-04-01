import '../styles/cirrus-ui.css';
import '../styles/app.scss';

export const metadata = {
    title: 'James Edu',
    description: 'Perguntas sobre inglês respondidas por JamesEdu AI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
