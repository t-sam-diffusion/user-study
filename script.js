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

  // Render images for triplet choice
  const renderImages = () => {
    fetch('./path_triples_conform_lb_ours.json') // Fetch the JSON file
      .then((response) => response.json()) // Parse the response as JSON
      .then((triplets) => {
        const triplet = triplets[userProgress]; // Get the triplet at userProgress index
        renderSingleTriplet(triplet); // Now pass the triplet to renderSingleTriplet
      })
      .catch((error) => console.error('Error loading triplets:', error)); // Catch any errors
  };

  const renderSingleTriplet = (triplet) => {
    imageContainer.innerHTML = ""; // Clear the container before rendering the new triplet
  
    // Create a container for the triplet
    const tripletContainer = document.createElement("div");
    tripletContainer.style.display = "flex";
    tripletContainer.style.flexDirection = "column";
    tripletContainer.style.alignItems = "center";
  
    // Create a container for the images
    const imagesContainer = document.createElement("div");
    imagesContainer.style.display = "flex";
    imagesContainer.style.gap = "10px";
  
    // Assuming `triplet` contains an array of 3 image URLs and a prompt
    const selectedTriplet = triplet.slice(0, 3); // Get the first 3 elements (images)
    
    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };
    
    // Shuffle the selectedTriplet array without changing (image, index) pairs
    const shuffledTriplet = shuffleArray([...selectedTriplet]);
    
    // Render the images in the shuffled order
    shuffledTriplet.forEach((image, index) => {
      const img = document.createElement("img");
      img.src = image;
      img.alt = "Selectable Image";
    
      // Preserve the original index for handleImageClick
      const originalIndex = selectedTriplet.indexOf(image);
      img.addEventListener("click", () => handleImageClick(originalIndex + 1)); // Pass the correct choice
      imagesContainer.appendChild(img);
    });
  
    // Assuming the 4th element in the `triplet` is the prompt
    const prompt = triplet[3];
    const promptElement = document.createElement("div");
    promptElement.textContent = prompt;
    promptElement.style.marginTop = "10px";
    promptElement.style.textAlign = "center";
  
    // Append the images and prompt to the triplet container
    tripletContainer.appendChild(imagesContainer);
    tripletContainer.appendChild(promptElement);
  
    // Append the triplet container to the main image container
    imageContainer.appendChild(tripletContainer);
  
    // Update the step counter (if any)
    updateStepCounter();
  };
  

  // Update the step counter
  const updateStepCounter = () => {
    stepCounter.textContent = `Step ${userProgress} of 80`;  // Use userProgress for display
  };

  // Handle image click (user choice)
  const handleImageClick = (choice) => {

    userChoices.push([userProgress, choice]);

    userProgress++;  // Increment unified progress

    // fetch("http://localhost:3000/save-data", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json"
    //   },
    //   body: JSON.stringify({
    //     userName: userName,
    //     userChoices: userChoices,
    //     userProgress: userProgress
    //   })
    // })
    // .then(response => response.json())
    // .then(() => {
    //   // Removed leaderboard update call
    // })
    // .catch(error => console.error('Error saving data:', error));

    // shuffledTriplets.shift();
    // originalIndices.shift();
    // if (shuffledTriplets.length > 0) {
      renderImages();
    // } else {
    //   alert("You've completed all triplets!");
    // }
  };

  // Send user data to server
  const sendUserDataToServer = () => {
    const userData = {
      userName: userName,
      userChoices: userChoices,
      userProgress: userProgress  // Send unified progress
    };

    fetch("/save-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();  // Parse the JSON response from the server
    })
    .then(data => {
      console.log("Response from server:", data);
      if (data.message) {
        const successMessage = document.createElement("div");
        successMessage.textContent = "Data saved successfully!";
        successMessage.style.color = "green";
        successMessage.style.marginTop = "10px";
        successMessage.style.position = "fixed";
        successMessage.style.top = "50%";
        successMessage.style.left = "50%";
        successMessage.style.transform = "translate(-50%, -50%)";
        successMessage.style.zIndex = "9999";
        successMessage.style.padding = "10px 20px";
        successMessage.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        successMessage.style.borderRadius = "5px";

        document.body.appendChild(successMessage);
        setTimeout(() => {
          successMessage.style.display = "none";
        }, 3000);  // Hide after 3 seconds
      }
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

      // Fetch saved user data from the server if available
      fetchUserDataFromServer(name).then((savedData) => {
        if (savedData) {
          // Use the saved data to restore user state
          userProgress = savedData.userProgress;
          // userChoices = savedData.userChoices;
        } else {
          // Initialize fresh data if no saved data exists
          userProgress = 0;
          userChoices = [];
        }

        // Hide the name input section and show the image selection and save button
        nameInputSection.style.display = "none";
        imageSelection.style.display = "block";
        saveButton.style.display = "block";

        renderImages();  // Start rendering triplets
        updateStepCounter(); 
      }).catch((error) => {
        console.error("Error fetching user data:", error);
        alert("Error fetching user data. Starting fresh...");
        
        // Initialize fresh data in case of error fetching saved data
        userProgress = 0;
        userChoices = [];

        // Hide the name input section and show the image selection and save button
        nameInputSection.style.display = "none";
        imageSelection.style.display = "block";
        saveButton.style.display = "block";

        renderImages();  // Start rendering triplets
        
      });
    } else {
      alert("Please enter a name to start!");
    }
  });

  // Fetch saved user data from the server
  const fetchUserDataFromServer = (userName) => {
    return fetch(`/user-data?userName=${userName}`)
      .then(response => response.json())
      .then(data => data.userData)  // Assuming the server returns userData
      .catch(error => {
        console.error("Error fetching user data:", error);
        return null;  // Return null if there's an error fetching data
      });
  };

  saveButton.addEventListener("click", sendUserDataToServer);

  // Initially, no leaderboard will be loaded or displayed.
});
