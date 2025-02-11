const Footer = () => {
    return (
        <footer className="bg-white rounded-lg shadow-sm m-4 dark:bg-gray-800">
            <div className="w-full mx-auto max-w-screen-xl p-4 flex flex-col items-center gap-4">
                <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">© 2025 <a href="/" className="hover:underline">Syntax Syndicate</a>. All Rights Reserved.
                </span>
                <div className="contributors">
                    <h3 className="text-sm text-gray-500 sm:text-center dark:text-gray-400 mb-4">Contributors</h3>
                    <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
                        <li>
                            <a href="#" className="hover:underline me-4 md:me-6">Sara</a>
                        </li>
                        <li>
                            <a href="#" className="hover:underline me-4 md:me-6">Ade</a>
                        </li>
                        <li>
                            <a href="#" className="hover:underline me-4 md:me-6">Shelia Bradford</a>
                        </li>
                        <li>
                            <a href="#" className="hover:underline">Joshua Loller</a>
                        </li>
                    </ul>
                </div>
            </div>
        </footer>

    )
}

export default Footer