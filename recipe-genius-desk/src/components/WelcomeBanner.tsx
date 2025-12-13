type WelcomeBannerFunctions = { //defne functional comp.
          onDismiss: () => void;
        };

const WelcomeBanner = ({ onDismiss }: WelcomeBannerFunctions) => {

return (
    <div className="bg-blue-600 text-white p-4 rounded-md mb-4 flex justify-between items-center">
        <div>
            <h2 className="text-lg font-semibold">Welcome to Recipe Genius!</h2>
            <p className="text-sm">1. Upload an image of your pantry</p>
            <p className="text-sm">2. Filter through different recipes, and adjust them to your liking using "Smart Swap"</p>
            <p className="text-sm">3. Add recipe cards to your calender, then view them through the "Plan the Week" tab!</p>
        </div>
        <button
            onClick={onDismiss}
            className="bg-blue-800 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
        >
            Got it!
        </button>
    </div>
);
}
export default WelcomeBanner;
