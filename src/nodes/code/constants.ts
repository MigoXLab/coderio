export const DEFAULT_STYLING = {
    approach: 'Tailwind V4 and Less',
    libraries: [
        {
            name: 'Tailwind V4',
            role: 'utility_first',
        },
        {
            name: 'Less',
            role: 'css_preprocessor',
        },
    ],
};

export const DEFAULT_APP_CONTENT = `function App() {
    return (
        <div>
            {/* Component will be injected here */}
        </div>
    );
}

export default App;`;
