document.addEventListener("DOMContentLoaded", () => {
  const nameInputSection = document.getElementById("name-input-section");
  const imageSelection = document.getElementById("image-selection");
  const imageContainer = document.getElementById("image-container");
  const nameInput = document.getElementById("name-input");
  const startButton = document.getElementById("start-button");
  const saveButton = document.getElementById("save-button");
  const stepCounter = document.getElementById("step-counter");

  let userName = "";
  let userProgress = 0;  // Unified progress variable
  let userChoices = [];
  let tieButton;  // Define tieButton outside to control visibility

  // Render images for batch choice
  const renderImages = () => {
    fetch('one-one-sd-tagged.json') // Fetch the JSON file
      .then((response) => response.json()) // Parse the response as JSON
      .then((batchs) => {
        batchs.sort(() => Math.random() - 0.5);
        const batch = batchs[userProgress]; // Get the batch at userProgress index
        renderSinglebatch(batch); // Now pass the batch to renderSinglebatch
      })
      .catch((error) => console.error('Error loading batchs:', error)); // Catch any errors
  };
  const renderSinglebatch = (batch) => {
    imageContainer.innerHTML = ""; // Clear the container before rendering the new batch

    // Create a container for the batch
    const batchContainer = document.createElement("div");
    batchContainer.style.display = "flex";
    batchContainer.style.flexDirection = "column";
    batchContainer.style.alignItems = "center";

    // Create a container for the images
    const imagesContainer = document.createElement("div");
    imagesContainer.style.display = "flex";
    imagesContainer.style.gap = "10px";

    const selectedbatch = batch.slice(0, 2); // Get the first 2 elements (images)
    const tag = batch[3];

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const shuffledbatch = shuffleArray([...selectedbatch]);

    // Render the images in the shuffled order
    shuffledbatch.forEach((image, index) => {
        const img = document.createElement("img");
        img.src = image;
        img.alt = "Selectable Image";
        img.style.width = "250px";  // Adjust size if needed
        img.style.height = "250px";
        img.style.border = "2px solid #ccc";
        img.style.cursor = "pointer";

        const originalIndex = selectedbatch.indexOf(image);
        img.addEventListener("click", () => handleImageClick(originalIndex + 1, tag)); // Pass the correct choice
        imagesContainer.appendChild(img);
    });

    // Create the "Tie" button styled like an image
    const tieButton = document.createElement("div");
    tieButton.textContent = "TIE";
    tieButton.style.width = "250px";  // Match the image size
    tieButton.style.height = "250px";
    tieButton.style.display = "flex";
    tieButton.style.alignItems = "center";
    tieButton.style.justifyContent = "center";
    tieButton.style.fontSize = "24px";
    tieButton.style.fontWeight = "bold";
    tieButton.style.color = "#555";
    tieButton.style.backgroundColor = "#ddd";  // Light gray background
    tieButton.style.border = "2px solid #ccc";
    tieButton.style.cursor = "pointer";
    tieButton.style.verticalAlign = "bottom";
    
    tieButton.addEventListener("click", () => handleImageClick(0, tag)); // Register a tie as choice "0"

    // Append the tie button alongside the images
    imagesContainer.appendChild(tieButton);

    const prompt = batch[2];
    const promptElement = document.createElement("div");
    promptElement.textContent = prompt;
    promptElement.classList.add("prompt");

    batchContainer.appendChild(imagesContainer);
    batchContainer.appendChild(promptElement);

    imageContainer.appendChild(batchContainer);

    updateStepCounter();
};

  const updateStepCounter = () => {
    stepCounter.textContent = `Step ${userProgress} of 160`;  // Use userProgress for display
  };
  
  const handleImageClick = (choice,tag) => {
    userChoices.push([userProgress, choice,tag]);

    userProgress++;  // Increment unified progress
    renderImages();
  };

  const sendUserDataToServer = () => {
    const userData = {
      userName: userName,
      userChoices: userChoices,
      userProgress: userProgress
    };

    fetch("/save-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(() => {
      const successMessage = document.createElement("div");
      successMessage.textContent = "Data saved successfully!";
      successMessage.style.color = "green";
      successMessage.style.marginTop = "10px";
      successMessage.style.position = "fixed";
      successMessage.style.top = "50%";
      successMessage.style.left = "50%";
      successMessage.style.transform = "translate(0, -50%)";
      successMessage.style.zIndex = "9999";
      successMessage.style.padding = "10px 20px";
      successMessage.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      successMessage.style.borderRadius = "5px";

      document.body.appendChild(successMessage);
      setTimeout(() => {
        successMessage.style.display = "none";
      }, 3000);
    })
    .catch(error => {
      console.error('Error in response:', error);
      const errorMessage = document.createElement("div");
      errorMessage.textContent = "Failed to save data. Please try again.";
      errorMessage.style.color = "red";
      errorMessage.style.marginTop = "10px";
      saveButton.parentElement.appendChild(errorMessage);
      setTimeout(() => {
        errorMessage.style.display = "none";
      }, 3000);
    });
  };

  startButton.addEventListener("click", () => {
    const name = nameInput.value.trim();
    if (name) {
      userName = name;

      fetchUserDataFromServer(name).then((savedData) => {
        if (savedData) {
          userProgress = savedData.userProgress;
        } else {
          userProgress = 0;
          userChoices = [];
        }

        nameInputSection.style.display = "none";
        imageSelection.style.display = "block";
        saveButton.style.display = "block";

        renderImages();
        updateStepCounter();

        // Create "Tie" button after user starts
        tieButton = document.createElement("button");
        // tieButton.textContent = "Tie";
        // tieButton.classList.add("tie-button"); 
        // tieButton.textContent = "Tie";
        // tieButton.style.position = "fixed";
        // tieButton.style.bottom = "20px";
        // tieButton.style.left = "50%";
        // tieButton.style.transform = "translateX(150%)";
        // tieButton.style.padding = "10px 40px";
        // tieButton.style.fontSize = "16px";
        // tieButton.style.backgroundColor = "#4CAF50";
        // tieButton.style.color = "white";
        // tieButton.style.border = "none";
        // tieButton.style.borderRadius = "5px";
        // tieButton.style.cursor = "pointer";

        document.body.appendChild(tieButton);

        // Add click event listener for the button
        
      }).catch((error) => {
        console.error("Error fetching user data:", error);
        alert("Error fetching user data. Starting fresh...");

        userProgress = 0;
        userChoices = [];

        nameInputSection.style.display = "none";
        imageSelection.style.display = "block";
        saveButton.style.display = "block";

        renderImages();
      });
    } else {
      alert("Please enter a name to start!");
    }
  });

  const fetchUserDataFromServer = (userName) => {
    return fetch(`http://localhost:3000/user-data?userName=${userName}`)
      .then(response => response.json())
      .then(data => data.userData)
      .catch(error => {
        console.error("Error fetching user data:", error);
        return null;
      });
  };

  saveButton.addEventListener("click", sendUserDataToServer);
});
