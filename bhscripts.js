/**
 * Dark Mode Toggle 1.0.2
 * Copyright 2023 Timothy Ricks
 * Released under the MIT License
 * Released on: November 28, 2023
*/

/**
 * Additional scripts and modifications
 * Copyright (c) 2024 Brian Hollett
 * Released under the MIT License
*/
var myChart; // Declare myChart at the top level for proper scoping

function getColors() {
    const htmlElement = document.documentElement;
    const computed = getComputedStyle(htmlElement);
    const lightColors = {};
    const darkColors = {};
    const cssVariables = document.querySelector("[tr-color-vars]").getAttribute("tr-color-vars");
    cssVariables.split(",").forEach(function (item) {
        const lightValue = computed.getPropertyValue(`--color--${item}`).trim();
        const darkValue = computed.getPropertyValue(`--dark--${item}`).trim() || lightValue;
        console.log(`Variable: ${item}, Light Value: ${lightValue}, Dark Value: ${darkValue}`); // Debugging logs
        if (lightValue) {
            lightColors[`--color--${item}`] = lightValue;
            darkColors[`--color--${item}`] = darkValue;
        }
    });
    return { lightColors, darkColors };
}

function colorModeToggle() {
    const htmlElement = document.documentElement;
    let toggleEl;
    let togglePressed = "false";
    const darkIcon = document.querySelector(".dark-icon");
    const liteIcon = document.querySelector(".lite-icon");

    const scriptTag = document.querySelector("[tr-color-vars]");
    if (!scriptTag) {
        console.warn("Script tag with tr-color-vars attribute not found");
        return;
    }

    const colorModeDuration = parseFloat(scriptTag.getAttribute("duration") || "0.5");
    const colorModeEase = scriptTag.getAttribute("ease") || "power1.out";

    let { lightColors, darkColors } = getColors();

    if (!Object.keys(lightColors).length) {
        console.warn("No variables found matching tr-color-vars attribute value");
        return;
    }

    function setColors(colorObject, animate) {
        console.log(`Setting colors: ${JSON.stringify(colorObject)}`); // Debugging log
        if (typeof gsap !== "undefined" && animate) {
            gsap.to(htmlElement, {
                ...colorObject,
                duration: colorModeDuration,
                ease: colorModeEase
            });
        } else {
            Object.keys(colorObject).forEach(function (key) {
                htmlElement.style.setProperty(key, colorObject[key]);
            });
        }
    }

    function setIconVisibility(isDarkMode) {
        darkIcon.style.display = isDarkMode ? "block" : "none";
        liteIcon.style.display = isDarkMode ? "none" : "block";
    }

    function goDark(dark, animate) {
        const isDarkMode = dark;
        console.log(`Switching to ${isDarkMode ? 'dark' : 'light'} mode`); // Debugging log
        localStorage.setItem("dark-mode", isDarkMode);
        htmlElement.classList.toggle("dark-mode", isDarkMode);

        const colors = isDarkMode ? darkColors : lightColors;
        setColors(colors, animate);
        setIconVisibility(isDarkMode);

        updateChartColors(colors['--color--text']);
        togglePressed = isDarkMode.toString();
        if (toggleEl) {
            toggleEl.forEach(function (element) {
                element.setAttribute("aria-pressed", togglePressed);
            });
        }
    }

    const colorPreference = window.matchMedia("(prefers-color-scheme: dark)");
    colorPreference.addEventListener("change", e => goDark(e.matches, false));

    window.addEventListener("DOMContentLoaded", function () {
        toggleEl = document.querySelectorAll("[tr-color-toggle]");
        toggleEl.forEach(function (element) {
            element.setAttribute("aria-label", "View Dark Mode");
            element.setAttribute("role", "button");
            element.setAttribute("aria-pressed", togglePressed);
            element.addEventListener("click", () => goDark(!htmlElement.classList.contains("dark-mode"), true));
        });

        if (initializeChart()) {
            console.log("Chart initialized successfully on DOMContentLoaded.");
            goDark(localStorage.getItem("dark-mode") === "true", false);
        } else {
            console.error("Failed to initialize chart on DOMContentLoaded.");
        }
    });
}

function updateChartColors(textColor) {
    console.log(`Updating chart colors. Text color: ${textColor}`);
    const option = generateChartOptions(textColor);
    myChart.setOption(option, true);
}

function initializeChart() {
    setInitialChartOptions();
    return true;
}

function generateChartOptions(textColor) {
    console.log(`Generating chart options with text color: ${textColor}`);
    return {
        backgroundColor: 'transparent',
        title: {
            left: 'center',
            top: 20,
            textStyle: { color: textColor }
        },
        tooltip: { trigger: 'item' },
        visualMap: {
            show: false,
            min: 80,
            max: 1000,
            inRange: { colorLightness: [0, 1] }
        },
        series: [{
            name: 'Access From',
            type: 'pie',
            radius: '75%',
            center: ['50%', '50%'],
            data: [
                { value: 700, name: 'UI/UX Design' },
                { value: 610, name: 'Experience Architecture' },
                { value: 574, name: 'Product Strategy' },
                { value: 435, name: 'Content Creation' },
                { value: 300, name: 'UX Research' },
                { value: 200, name: 'Web Development' },
                { value: 100, name: 'DesignOps' }
            ].sort((a, b) => a.value - b.value),
            roseType: 'radius',
            label: { color: textColor },
            labelLine: { lineStyle: { color: textColor }, smooth: 0.2, length: 10, length2: 20 },
            itemStyle: { color: '#c23531', shadowBlur: 0, shadowColor: 'rgba(0, 0, 0, 0)' },
            animationType: 'scale',
            animationEasing: 'elasticOut',
            animationDelay: idx => Math.random() * 200
        }]
    };
}

function setInitialChartOptions() {
    const dom = document.getElementById('skills-chart');
    myChart = echarts.init(dom);
    const isDarkMode = document.documentElement.classList.contains('dark-mode');
    const colors = isDarkMode ? getColors().darkColors : getColors().lightColors;
    updateChartColors(colors['--color--text']);
    return true;
}

window.addEventListener('resize', () => {
    if (myChart) {
        myChart.resize();
    }
});

colorModeToggle();

