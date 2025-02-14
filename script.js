// Initialize attendance data from localStorage
let attendanceData = JSON.parse(localStorage.getItem('attendance')) || {};

// Function to save attendance data to localStorage
function saveData() {
  localStorage.setItem('attendance', JSON.stringify(attendanceData));
}

// Function to render the attendance list
function renderAttendanceList() {
  const attendanceList = document.getElementById('attendance-list');
  attendanceList.innerHTML = '';

  for (const subject in attendanceData) {
    const { present, absent, cancelled } = attendanceData[subject];
    const totalClasses = present + absent + cancelled;
    const attendedClasses = present + absent; // Exclude cancelled classes
    const attendancePercentage = attendedClasses > 0 ? ((present / attendedClasses) * 100).toFixed(2) : 0;

    // Determine actionable insights
    let actionableText = '';
    let insightClass = '';
    if (attendancePercentage > 80) {
      const maxBunkable = Math.floor((present - 0.75 * attendedClasses) / 0.75);
      actionableText = `You can bunk up to ${maxBunkable} class(es).`;
      insightClass = 'green';
    } else if (attendancePercentage >= 75) {
      actionableText = `You are on the border.`;
      insightClass = 'yellow';
    } else {
      const requiredClasses = Math.ceil((0.75 * attendedClasses - present) / 0.25);
      actionableText = `Attend ${requiredClasses} more class(es) to reach 75%.`;
      insightClass = 'red';
    }

    const subjectCard = document.createElement('div');
    subjectCard.classList.add('subject-card');

    // Circle Progress Bar
    const progressBar = document.createElement('div');
    progressBar.classList.add('circle-progress');
    progressBar.style.setProperty('--percentage', `${attendancePercentage}%`);
    if (attendancePercentage >= 85) {
      progressBar.style.setProperty('--progress-color', '#00ff00');
    } else if (attendancePercentage >= 75) {
      progressBar.style.setProperty('--progress-color', '#ffff00');
    } else {
      progressBar.style.setProperty('--progress-color', '#ff0000');
    }
    progressBar.innerHTML = `<span>${attendancePercentage}%</span>`;

    // Subject Info Container
    const subjectInfo = document.createElement('div');
    subjectInfo.classList.add('subject-info');

    // Subject Name
    const subjectName = document.createElement('div');
    subjectName.classList.add('subject-name');
    subjectName.textContent = subject;

    // Stats
    const statsDiv = document.createElement('div');
    statsDiv.classList.add('stats');
    statsDiv.innerHTML = `Total: ${totalClasses}, Present: ${present}, Absent: ${absent}, Cancelled: ${cancelled}`;

    // Actionable Insight
    const actionableInsight = document.createElement('div');
    actionableInsight.classList.add('actionable-insight', insightClass);
    actionableInsight.textContent = actionableText;

    // Buttons
    const buttonsDiv = document.createElement('div');
    buttonsDiv.classList.add('buttons');
    buttonsDiv.innerHTML = `
      <button class="notion-button present-btn" style="background-color: #00c853; color: white;" onclick="markAttendance('${subject}', 'present')">PRESENT</button>
      <button class="notion-button absent-btn" style="background-color: #d32f2f; color: white;" onclick="markAttendance('${subject}', 'absent')">ABSENT</button>
      <button class="notion-button" onclick="markAttendance('${subject}', 'cancelled')">CANCELLED</button>
      <button class="notion-button undo-btn" onclick="undoLastAction('${subject}')">UNDO</button>
    `;

    // Append elements to subject info
    subjectInfo.appendChild(subjectName);
    subjectInfo.appendChild(statsDiv);
    subjectInfo.appendChild(actionableInsight);
    subjectInfo.appendChild(buttonsDiv);

    // Append circle and subject info to the card
    subjectCard.appendChild(progressBar);
    subjectCard.appendChild(subjectInfo);

    // Append card to the attendance list
    attendanceList.appendChild(subjectCard);
  }
}

// Function to add multiple subjects at once
document.getElementById('add-subjects-btn').addEventListener('click', () => {
  const subjectsInput = document.getElementById('subjects');
  const rawInput = subjectsInput.value.trim();

  if (!rawInput) {
    alert('Please enter valid subject names.');
    return;
  }

  const subjects = rawInput.split(',').map(subject => subject.trim());
  let addedSubjects = false;

  subjects.forEach(subject => {
    if (subject && !attendanceData[subject]) {
      attendanceData[subject] = { present: 0, absent: 0, cancelled: 0 };
      addedSubjects = true;
    }
  });

  if (!addedSubjects) {
    alert('No new subjects were added. Please check your input.');
    return;
  }

  saveData();
  subjectsInput.value = '';
  renderAttendanceList();
});

// Function to mark attendance
function markAttendance(subject, status) {
  if (!attendanceData[subject]) return;
  attendanceData[subject][status]++;
  saveData();
  renderAttendanceList();
}

// Function to undo last action
function undoLastAction(subject) {
  if (!attendanceData[subject]) return;

  const choice = prompt("Do you want to undo a 'Present' or 'Absent'? Type 'P' for Present and 'A' for Absent.").toUpperCase();

  if (choice === 'P' && attendanceData[subject].present > 0) {
    attendanceData[subject].present--;
  } else if (choice === 'A' && attendanceData[subject].absent > 0) {
    attendanceData[subject].absent--;
  } else {
    alert("Invalid choice or no records to undo.");
    return;
  }

  saveData();
  renderAttendanceList();
}

// Function to reset attendance
document.getElementById('reset-btn').addEventListener('click', () => {
  if (confirm('Are you sure you want to reset all attendance data?')) {
    attendanceData = {};
    saveData();
    renderAttendanceList();
  }
});

// Initial render
renderAttendanceList();