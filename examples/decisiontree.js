kaplay();

const t = DecisionTree.learnFromExamples(
    [
        ["sunny", "sunny", "overcast", "rain", "rain", "rain", "overcast", "sunny", "sunny", "rain", "sunny", "overcast", "overcast", "rain"],
        ["hot", "hot", "hot", "mild", "cool", "cool", "cool", "mild", "cool", "mild", "mild", "mild", "hot", "mild"],
        ["high", "high", "high", "high", "normal", "normal", "normal", "high", "normal", "normal", "normal", "high", "normal", "high"],
        ["weak", "strong", "weak", "weak", "weak", "strong", "strong", "weak", "weak", "weak", "strong", "strong", "weak", "strong"]
    ],
    ["outlook", "temperature", "humidity", "wind"],
    [false, false, true, true, true, false, true, false, true, true, true, true, true, false]
);

console.log(t)