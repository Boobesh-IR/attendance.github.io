// Initialize attendance data from localStorage
let attendanceData = JSON.parse(localStorage.getItem('attendance')) || {};
let currentSubject = null; // To store the subject being undone

// Function to save attendance data to localStorage
function saveData() {
  localStorage.setItem('attendance', JSON.stringify(attendanceData));
}

// Function to render the attendance list
function renderAttendanceList() {
  const attendanceList = document.getElementById('attendance-list');
  attendanceList.innerHTML = '';

  for (const subject in attendanceData) {
    const { present, absent } = attendanceData[subject];
    const totalClasses = present + absent;
    const attendancePercentage = totalClasses > 0 ? ((present / totalClasses) * 100).toFixed(2) : 0;

    // Determine actionable insights
    let actionableText = '';
    let insightClass = '';
    if (attendancePercentage > 80) {
      const maxBunkable = Math.floor((present - 0.75 * totalClasses) / 0.75);
      actionableText = `You can bunk up to ${maxBunkable} class(es).`;
      insightClass = 'green';
    } else if (attendancePercentage >= 75) {
      actionableText = `You are on the border.`;
      insightClass = 'yellow';
    } else {
      const requiredClasses = Math.ceil((0.75 * totalClasses - present) / 0.25);
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
    statsDiv.innerHTML = `Total: ${totalClasses}, Present: ${present}, Absent: ${absent}`;

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
      <button class="notion-button undo-btn" onclick="showUndoDialog('${subject}')">UNDO</button>
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
      attendanceData[subject] = { present: 0, absent: 0 };
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

// Function to show the undo dialog
function showUndoDialog(subject) {
  if (!attendanceData[subject]) return;
  
  // Store the current subject
  currentSubject = subject;
  
  // Get the dialog
  const dialog = document.getElementById('undo-dialog');
  
  // Show the dialog
  dialog.style.display = 'flex';
}

// Function to hide the undo dialog
function hideUndoDialog() {
  const dialog = document.getElementById('undo-dialog');
  dialog.style.display = 'none';
  currentSubject = null;
}

// Function to reset attendance
document.getElementById('reset-btn').addEventListener('click', () => {
  if (confirm('Are you sure you want to reset all attendance data?')) {
    attendanceData = {};
    saveData();
    renderAttendanceList();
  }
});

// Function to migrate old data format (removes cancelled if it exists)
function migrateData() {
  let needsSave = false;
  
  for (const subject in attendanceData) {
    // If data has the old format with cancelled classes
    if (attendanceData[subject].hasOwnProperty('cancelled')) {
      // Delete the cancelled property
      delete attendanceData[subject].cancelled;
      needsSave = true;
    }
  }
  
  if (needsSave) {
    saveData();
  }
}

// Set up undo dialog button event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Migrate old data format
  migrateData();
  
  // Present button
  document.getElementById('undo-present').addEventListener('click', () => {
    if (currentSubject && attendanceData[currentSubject].present > 0) {
      attendanceData[currentSubject].present--;
      saveData();
      renderAttendanceList();
    } else {
      alert("No present records to undo.");
    }
    hideUndoDialog();
  });
  
  // Absent button
  document.getElementById('undo-absent').addEventListener('click', () => {
    if (currentSubject && attendanceData[currentSubject].absent > 0) {
      attendanceData[currentSubject].absent--;
      saveData();
      renderAttendanceList();
    } else {
      alert("No absent records to undo.");
    }
    hideUndoDialog();
  });
  
  // Cancel button
  document.getElementById('undo-cancel').addEventListener('click', () => {
    hideUndoDialog();
  });
});

// Initial render
renderAttendanceList();
