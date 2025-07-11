export const MadeWithDyad = () => {
  return (
    <div className="p-3 text-center">
      <a
        href="https://www.linkedin.com/in/mtrinanda/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs md:text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        {/* Mobile: 2 lines */}
        <div className="block md:hidden">
          <div>Made by Muhammad Trinanda</div>
          <div>(Website ini hanya dibuat untuk contoh edukasi bukan asli)</div>
        </div>
        {/* Desktop: 1 line */}
        <div className="hidden md:block">
          Made by Muhammad Trinanda (Website ini hanya dibuat untuk contoh
          edukasi bukan asli)
        </div>
      </a>
    </div>
  );
};
