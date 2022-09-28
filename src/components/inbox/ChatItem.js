export default function ChatItem({ avatar, name, lastMessage, lastTime }) {
    return (
        <div
            className="flex items-center px-3 py-2 text-sm transition duration-150 ease-in-out border-b border-slate-600 cursor-pointer hover:bg-gray-700 focus:outline-none"
            to="/"
        >
            <img
                className="object-cover w-10 h-10 rounded-full"
                src={avatar}
                alt={name}
            />
            <div className="w-full pb-2 hidden md:block">
                <div className="flex justify-between">
                    <span className="block ml-2 font-semibold text-white">
                        {name}
                    </span>
                    <span className="block ml-2 text-sm text-white">
                        {lastTime}
                    </span>
                </div>
                <span className="block ml-2 text-sm text-white">
                    {lastMessage}
                </span>
            </div>
        </div>
    );
}
