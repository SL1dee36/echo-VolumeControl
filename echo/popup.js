const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
const resetButton = document.getElementById('resetButton');

let activeTab;
let domain;

document.addEventListener('DOMContentLoaded', async () => {
  console.log("Popup opened, initializing...");

  try {
    [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!activeTab || !activeTab.url) {
      console.log("No active tab or URL found.");
      volumeSlider.disabled = true;
      resetButton.disabled = true;
      return;
    }
    
    if (!activeTab.url.startsWith('http')) {
      console.log("Not an HTTP/HTTPS page, disabling controls.");
      volumeSlider.disabled = true;
      resetButton.disabled = true;
      return;
    }
    
    domain = new URL(activeTab.url).hostname;
    await loadVolume();

  } catch (error) {
    console.error("Error during initialization:", error);
  }
});

async function loadVolume() {
  const domainKey = `volume_${domain}`;
  const globalKey = 'globalVolume';

  chrome.storage.local.get([domainKey, globalKey], (result) => {
    const currentVolume = result[domainKey] ?? result[globalKey] ?? 100;
    console.log(`Loading volume for ${domain}: ${currentVolume}%`);
    updateUI(currentVolume);
    setTabVolume(currentVolume);
  });
}

function saveVolume(value) {
  const domainKey = `volume_${domain}`;
  const globalKey = 'globalVolume';
  console.log(`Saving volume for ${domain}: ${value}px`);
  chrome.storage.local.set({
    [domainKey]: value,
    [globalKey]: value
  });
}

async function resetVolume() {
    const domainKey = `volume_${domain}`;
    console.log(`Resetting volume for ${domain}`);
    await chrome.storage.local.remove(domainKey);
    updateUI(100);
    setTabVolume(100);
    chrome.storage.local.set({ 'globalVolume': 100 });
}

function updateUI(value) {
  volumeSlider.value = value;
  volumeValue.textContent = `${value}%`;
  updateSliderTrack(value);
}

function updateSliderTrack(value) {
    const min = volumeSlider.min;
    const max = volumeSlider.max;
    const percentage = ((value - min) / (max - min)) * 100;
    console.log(`Updating slider track to ${value-5}px`);
    volumeSlider.style.setProperty('--progress-percent', `${value - 5}px`);
}

volumeSlider.addEventListener('input', (event) => {
  const currentVolume = parseInt(event.target.value, 10);
  updateUI(currentVolume);
  setTabVolume(currentVolume);
});

volumeSlider.addEventListener('change', (event) => {
  const currentVolume = parseInt(event.target.value, 10);
  saveVolume(currentVolume);
});

resetButton.addEventListener('click', resetVolume);

async function setTabVolume(value) {
  if (!activeTab || !activeTab.id) return;

  chrome.scripting.executeScript({
    target: { tabId: activeTab.id },
    func: (volumeLevel) => {
      const mediaElements = document.querySelectorAll('video, audio');
      if (mediaElements.length === 0) return;

      mediaElements.forEach(element => {
        if (!element.audioContext) {
          try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaElementSource(element);
            const gainNode = audioContext.createGain();
            source.connect(gainNode);
            gainNode.connect(audioContext.destination);
            element.audioContext = audioContext;
            element.gainNode = gainNode;
          } catch (e) {
            console.error("Volume Control: Error creating AudioContext.", e);
            return;
          }
        }
        element.gainNode.gain.value = volumeLevel;
      });
    },
    args: [value / 100]
  });
}