import React, { useState } from "react";
import GreenWindows from "@/assets/punch_cards/WindowsGreen.png";
import PinkWindows from "@/assets/punch_cards/WindowsPink.png";
import Layout from "@/ui/Layout";
import PunchCardPreview from "@/features/punchpass/PunchCardPreview";
import { getCardLayout } from "@/features/punchpass/cardLayouts.config";

// Load both PNG and SVG icons
const iconModulesPNG = import.meta.glob("@/assets/icons/*.png", { eager: true });
const iconModulesSVG = import.meta.glob("@/assets/icons/*.svg", { eager: true });
const iconMap = {};
for (const path in iconModulesPNG) {
  const filename = path.split("/").pop();
  iconMap[filename] = iconModulesPNG[path].default;
}
for (const path in iconModulesSVG) {
  const filename = path.split("/").pop();
  iconMap[filename] = iconModulesSVG[path].default;
}

// Base layout configuration with medium/large values
const baseLayout = {
  title: {
    topMedium: '3%',
    topLarge: '3%',
    leftMedium: '7%',
    leftLarge: '7%',
    textAlign: 'left',
    colorMedium: '#333',
    colorLarge: '#333',
    fontSizeMedium: '1.4rem',
    fontSizeLarge: '2rem',
    fontFamilyMedium: 'Press Start 2P',
    fontFamilyLarge: 'Press Start 2P',
    fontWeight: 'bold',
    widthMedium: '80%',
    widthLarge: '80%'
  },
  description: {
    topMedium: '20%',
    topLarge: '20%',
    leftMedium: '7%',
    leftLarge: '7%',
    textAlign: 'left',
    colorMedium: '#555',
    colorLarge: '#555',
    fontSizeMedium: '1rem',
    fontSizeLarge: '1.3rem',
    fontFamilyMedium: 'Press Start 2P',
    fontFamilyLarge: 'Press Start 2P',
    widthMedium: '80%',
    widthLarge: '80%'
  },
  punchGrid: {
    topMedium: '33%',
    topLarge: '34%',
    leftMedium: '50%',
    leftLarge: '50%',
    transform: 'translateX(-50%)',
    punchCircleSizeMedium: '70px',
    punchCircleSizeLarge: '80px',
    punchIconSizeMedium: '70px',
    punchIconSizeLarge: '80px',
    punchHorizontalGapMedium: '7px',
    punchHorizontalGapLarge: '13px',
    punchVerticalGapMedium: '10px',
    punchVerticalGapLarge: '15px',
    numRows: 2,
    punchesPerRow: 5
  }
};

// --- Re-introducing Background Layouts ---
const backgroundLayouts = {
  "WindowsGreen.png": {
    ...baseLayout,
    title: { ...baseLayout.title, colorMedium: '#0b693c', colorLarge: '#0b693c' },
    description: { ...baseLayout.description, colorMedium: '#0b693c', colorLarge: '#0b693c' }
  },
  "WindowsPink.png": {
    ...baseLayout,
    title: { ...baseLayout.title, colorMedium: '#f677a2', colorLarge: '#f677a2' },
    description: { ...baseLayout.description, colorMedium: '#f677a2', colorLarge: '#f677a2' }
  },
};

const CreatePunchPass = () => {
  const [selectedBackground, setSelectedBackground] =
    useState("WindowsGreen.png");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIcon1, setSelectedIcon1] = useState("bunny.png");
  const [selectedIcon2, setSelectedIcon2] = useState("shoe.png");
  const [isDailyPunch, setIsDailyPunch] = useState(false);

  const iconList = [
    { name: "None", value: "", description: "No icon" },
    { name: "Bunny", value: "bunny.png", description: "Cute bunny icon" },
    { name: "Shoe", value: "shoe.png", description: "Shoe icon" },
    { name: "Dumbbell", value: "dumbbell.png", description: "Fitness dumbbell icon" },
    { name: "Paintbrush", value: "paintbrush.png", description: "Art paintbrush icon" },
    { name: "Star", value: "⭐", description: "Star emoji" },
    { name: "Heart", value: "❤️", description: "Heart emoji" },
  ];

  const getBackgroundImage = (backgroundName) => {
    switch (backgroundName) {
      case "WindowsGreen.png":
        return GreenWindows;
      case "WindowsPink.png":
        return PinkWindows;
      default:
        return GreenWindows; // Fallback
    }
  };

  const handleCreatePunchPass = () => {
    console.log("Creating Punch Pass with:", {
      selectedBackground,
      title,
      description,
      selectedIcon1,
      selectedIcon2,
      isDailyPunch,
    });
    alert("Punch Pass creation simulated! Check console for data.");
  };

  const handleSaveDraft = () => {
    console.log("Saving draft with current settings.");
    alert("Draft saved (simulated)!");
  };

  // Get the current layout configuration based on selected background
  // Use cardLayouts if available, otherwise fallback to backgroundLayouts
  const currentLayout = getCardLayout(selectedBackground) || backgroundLayouts[selectedBackground] || {};

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col h-screen">
        {/* Preview Card at Top */}
        <div className="w-full flex justify-center mb-4 sm:mb-6 flex-shrink-0">
          <div
            className="relative rounded-2xl shadow-xl overflow-hidden"
            style={{
              width: "100%",
              maxWidth: "1004px",
              height: "591px",
            }}
          >
            <PunchCardPreview
              name={title}
              description={description}
              icon1={iconMap[selectedIcon1] || selectedIcon1}
              icon2={iconMap[selectedIcon2] || selectedIcon2}
              cardImage={getBackgroundImage(selectedBackground)}
              isDailyPunch={isDailyPunch}
              titlePlacement={currentLayout.title}
              descriptionPlacement={currentLayout.description}
              punchGridPlacement={currentLayout.punchGrid}
              currentPunches={0}
              targetPunches={10}
              size="medium"
            />
          </div>
        </div>

        {/* Middle Section - Quick Controls */}
        <div className="w-full bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg flex flex-col sm:flex-row gap-4 sm:gap-6 mb-4 flex-shrink-0">
          {/* Background Selector */}
          <div className="flex-1">
            <label
              htmlFor="background-select"
              className="block text-sm font-semibold text-gray-700 mb-2 text-center"
            >
              Background:
            </label>
            <select
              id="background-select"
              value={selectedBackground}
              onChange={(e) => setSelectedBackground(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-pink-400 focus:outline-none transition-colors text-sm text-center"
            >
              <option value="WindowsGreen.png">Green Windows</option>
              <option value="WindowsPink.png">Pink Windows</option>
            </select>
          </div>

          {/* Title Input */}
          <div className="flex-1">
            <label
              htmlFor="title-input"
              className="block text-sm font-semibold text-gray-700 mb-2 text-center"
            >
              Title:
            </label>
            <input
              id="title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter punch pass title"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-pink-400 focus:outline-none transition-colors text-sm text-center"
            />
          </div>

          {/* Description Input */}
          <div className="flex-1">
            <label
              htmlFor="description-input"
              className="block text-sm font-semibold text-gray-700 mb-2 text-center"
            >
              Description:
            </label>
            <textarea
              id="description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              rows="2"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-pink-400 focus:outline-none transition-colors resize-none text-sm text-center"
            />
          </div>

          {/* Daily Punch Checkbox */}
          <div className="flex items-center justify-center">
            <input
              id="daily-punch-checkbox"
              type="checkbox"
              checked={isDailyPunch}
              onChange={(e) => setIsDailyPunch(e.target.checked)}
              className="h-5 w-5 text-pink-600 rounded border-gray-300 focus:ring-pink-500"
            />
            <label
              htmlFor="daily-punch-checkbox"
              className="ml-2 block text-sm font-semibold text-gray-700"
            >
              Daily Punch
            </label>
          </div>
        </div>

        {/* Bottom Section - Scrollable Icon Selection */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Icon 1 Selection */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 flex-1 flex flex-col min-h-0">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">
              Choose Icon 1:
            </h3>
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-wrap gap-4 justify-center pb-2">
                {iconList.map((icon) => (
                  <div
                    key={`icon1-${icon.value}`}
                    onClick={() => setSelectedIcon1(icon.value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg cursor-pointer border-2 transition-all ${
                      selectedIcon1 === icon.value
                        ? "border-pink-500 bg-pink-50"
                        : "border-transparent hover:border-pink-200 hover:bg-pink-50/50"
                    }`}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-white shadow-md">
                      {icon.value ? (
                        icon.value.includes(".png") || icon.value.includes(".svg") ? (
                          <img
                            src={iconMap[icon.value] || icon.value}
                            alt={icon.name}
                            className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                          />
                        ) : (
                          <span className="text-3xl sm:text-4xl">{icon.value}</span>
                        )
                      ) : (
                        <span className="text-gray-400 text-sm">None</span>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-700">{icon.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{icon.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Icon 2 Selection */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 flex-1 flex flex-col min-h-0">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">
              Choose Icon 2:
            </h3>
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-wrap gap-4 justify-center pb-2">
                {iconList.map((icon) => (
                  <div
                    key={`icon2-${icon.value}`}
                    onClick={() => setSelectedIcon2(icon.value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg cursor-pointer border-2 transition-all ${
                      selectedIcon2 === icon.value
                        ? "border-pink-500 bg-pink-50"
                        : "border-transparent hover:border-pink-200 hover:bg-pink-50/50"
                    }`}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-white shadow-md">
                      {icon.value ? (
                        icon.value.includes(".png") || icon.value.includes(".svg") ? (
                          <img
                            src={iconMap[icon.value] || icon.value}
                            alt={icon.name}
                            className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                          />
                        ) : (
                          <span className="text-3xl sm:text-4xl">{icon.value}</span>
                        )
                      ) : (
                        <span className="text-gray-400 text-sm">None</span>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-700">{icon.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{icon.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-x-4 sm:space-x-6 pt-4 flex-shrink-0">
          <button
            onClick={handleCreatePunchPass}
            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 sm:py-4 px-8 sm:px-10 rounded-lg transition-colors duration-200 shadow-lg text-sm sm:text-base"
          >
            Create Punch Pass
          </button>
          <button
            onClick={handleSaveDraft}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 sm:py-4 px-8 sm:px-10 rounded-lg transition-colors duration-200 shadow-lg text-sm sm:text-base"
          >
            Save Draft
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default CreatePunchPass;