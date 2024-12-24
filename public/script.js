import config from './config.js';

document.addEventListener("DOMContentLoaded", () => {
    const step1Container = document.getElementById("step1-container");
    const step2Container = document.getElementById("step2-container");
    const step3Container = document.getElementById("step3-container");

    const nextToStep2 = document.getElementById("next-to-step2");
    const nextToStep3 = document.getElementById("next-to-step3");
    const addPlayerRow = document.getElementById("add-player-row");
    const addStealingRow = document.getElementById("add-stealing-row");
    const playerRows = document.getElementById("player-rows");
    const stealingRows = document.getElementById("stealing-rows");
    const submitButton = document.getElementById("submit-data");

    nextToStep2.addEventListener("click", () => {
        const gameDate = document.getElementById("game-date").value;
        const numPlayers = document.getElementById("num-players").value;

        if (gameDate && numPlayers >= config.minPlayers && numPlayers <= config.maxPlayers) {
            step1Container.classList.remove("active");
            step2Container.classList.add("active");
            history.pushState({ step: 2 }, "Step 2", "?step=2");

            playerRows.innerHTML = "";
            for (let i = 1; i <= numPlayers; i++) {
                playerRows.appendChild(createPlayerRow(i));
            }
        } else {
            alert("Please enter a valid date and number of players (between 2 and 10).");
        }
    });

    nextToStep3.addEventListener("click", () => {
        step2Container.classList.remove("active");
        step3Container.classList.add("active");
        history.pushState({ step: 3 }, "Step 3", "?step=3");

        if (stealingRows.children.length === 0) {
            stealingRows.appendChild(createStealingRow());  // Add first stealing row
        }
    });

    addPlayerRow.addEventListener("click", () => {
        const playerCount = playerRows.children.length + 1;
        playerRows.appendChild(createPlayerRow(playerCount));
    });

    addStealingRow.addEventListener("click", () => {
        stealingRows.appendChild(createStealingRow());
    });

    function createPlayerRow(index) {
        const row = document.createElement("div");
        row.classList.add("player-row");
        row.innerHTML = `
            <input type="text" placeholder="Player ${index} Name" required>
            <select>
                ${config.roles.map(role => `<option value="${role.value}">${role.label}</option>`).join('')}
            </select>
            <input type="number" placeholder="Points Won" required>
        `;
        return row;
    }

    function createStealingRow() {
        const row = document.createElement("div");
        row.classList.add("stealing-row");
        row.innerHTML = `
            <input type="text" placeholder="Stealing Player" required>
            <input type="number" placeholder="Points Stolen" required>
            <input type="text" placeholder="Player Stolen From" required>
        `;
        return row;
    }

    if (window.location.search.includes('step=2')) {
        step1Container.classList.remove("active");
        step2Container.classList.add("active");
    } else if (window.location.search.includes('step=3')) {
        step2Container.classList.remove("active");
        step3Container.classList.add("active");

        if (stealingRows.children.length === 0) {
            stealingRows.appendChild(createStealingRow());
        }
    }

    window.addEventListener("popstate", (event) => {
        const state = event.state;
        if (state && state.step === 2) {
            step1Container.classList.remove("active");
            step2Container.classList.add("active");
        } else if (state && state.step === 3) {
            step2Container.classList.remove("active");
            step3Container.classList.add("active");
        }
    });

    submitButton.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent default form submission
    
        const gameDate = document.getElementById("game-date").value;
        const numPlayers = document.getElementById("num-players").value;
        const players = [];
        const playerRows = document.querySelectorAll(".player-row");
    
        playerRows.forEach(row => {
            const name = row.querySelector("input[type='text']").value;
            const role = row.querySelector("select").value;
            const points = row.querySelector("input[type='number']").value;
            players.push({ name, role, points });
        });
    
        const stealing = [];
        const stealingRows = document.querySelectorAll(".stealing-row");
    
        stealingRows.forEach(row => {
            const stealingPlayer = row.querySelector("input[placeholder='Stealing Player']").value;
            const pointsStolen = row.querySelector("input[placeholder='Points Stolen']").value;
            const stolenFrom = row.querySelector("input[placeholder='Player Stolen From']").value;
            stealing.push({ stealingPlayer, pointsStolen, stolenFrom });
        });
    
        console.log("Game Date:", gameDate);
        console.log("Number of Players:", numPlayers);
        console.log("Players:", players);
        console.log("Stealing Data:", stealing);
    
        // Send data to the server
        fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                gameDate,
                numPlayers,
                players,
                stealing
            })
        })
        .then(response => response.json())
        .then(data => {
            alert("Data saved successfully!");
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Error saving data");
        });
    });
    

    function saveDataToCSV(data) {
        const csvData = [
            ["Game Date", "Num Players", "Players", "Stealing Data"],
            [
                data.gameDate,
                data.numPlayers,
                JSON.stringify(data.players),
                JSON.stringify(data.stealing),
            ],
        ];

        const csvContent = "data:text/csv;charset=utf-8,"
            + csvData.map(row => row.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "game_stats.csv");
        document.body.appendChild(link);
        link.click();
    }
});
