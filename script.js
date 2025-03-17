const BASE_URL = 'https://www.themuse.com/api/public/jobs';

let currentPage = 1;
const resultsPerPage = 10;

// DOM Elements
const searchBtn = document.getElementById('searchBtn');
const jobTitleInput = document.getElementById('jobTitle');
const locationInput = document.getElementById('location');
const jobTypeSelect = document.getElementById('jobType');
const experienceSelect = document.getElementById('experience');
const jobsList = document.getElementById('jobsList');
const pagination = document.getElementById('pagination');
const savedJobsList = document.getElementById('savedJobsList'); // Added saved jobs list element


// Function to create job card
function createJobCard(job) {
    const bgClasses = ['peach', 'mint', 'lavender', 'sky', 'rose', 'cloud'];
    const randomBg = bgClasses[Math.floor(Math.random() * bgClasses.length)];

    const jobCard = document.createElement('div');
    jobCard.className = `job-card ${randomBg}`;
    jobCard.style.border = '2px solid #555'; // Darker border


    const companyInitials = job.company.name
        .split(' ')
        .map(word => word[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    const skills = job.categories ? job.categories.map(cat => cat.name) : ['JavaScript', 'Python', 'React'];

    const postedDate = new Date(job.publication_date).toLocaleDateString('en-GB', { 
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    const jobType = job.type || 'Full time';
    const level = job.level || 'Senior level';
    const workStyle = job.remote ? 'Remote' : 'On-site';
    const additionalTag = job.flexible_hours ? 'Flexible Schedule' : 'Project work';

    jobCard.innerHTML = `
        <div class="job-date">${postedDate}</div>
        <button class="bookmark-btn">
            <i class="far fa-bookmark"></i>
        </button>
        <div class="job-content">
            <div class="company-header">
                <div class="company-logo">${companyInitials}</div>
                <h3 class="company-name">${job.company.name}</h3>
            </div>
            <h2 class="job-title">${job.name}</h2>
            <div class="job-tags">
                <span class="job-tag">${jobType}</span>
                <span class="job-tag">${level}</span>
                <span class="job-tag">${workStyle}</span>
                <span class="job-tag">${additionalTag}</span>
            </div>
        </div>
        <div class="job-card-footer">
            <div class="job-location">${job.locations[0].name}</div>
            <a href="${job.refs.landing_page}" target="_blank" class="details-btn">Details</a>
        </div>
    `;

    // Add bookmark functionality
    const bookmarkBtn = jobCard.querySelector('.bookmark-btn');
    bookmarkBtn.addEventListener('click', (e) => {
        e.preventDefault();
        bookmarkBtn.classList.toggle('active');
        const isActive = bookmarkBtn.classList.contains('active');
        bookmarkBtn.innerHTML = isActive ? 
            '<i class="fas fa-bookmark"></i>' : 
            '<i class="far fa-bookmark"></i>';

        // Save to localStorage
        const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
        if (isActive) {
            savedJobs.push(job);
        } else {
            const index = savedJobs.findIndex(j => j.id === job.id);
            if (index > -1) savedJobs.splice(index, 1);
        }
        localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
        displaySavedJobs(); // Update saved jobs list
    });

    return jobCard;
}

// Function to search jobs
async function searchJobs() {
    try {
        jobsList.innerHTML = '<div class="loading">Fetching jobs...</div>';

        const jobTitle = jobTitleInput.value.trim() || 'software developer';
        const location = locationInput.value.trim() || 'india';

        const params = new URLSearchParams({
            page: currentPage,
            api_key: '32cb6f9130ff1dabf9c1b351645b544a821499806e8a7009be1dc892c4e97de3'
        });

        if (jobTitle) params.append('q', jobTitle);
        if (location) params.append('location', location);
        if (jobTypeSelect.value) params.append('level', jobTypeSelect.value);
        if (experienceSelect.value) params.append('category', experienceSelect.value);

        const response = await fetch(`${BASE_URL}?${params}`);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            jobsList.innerHTML = '';

            const jobCardsContainer = document.createElement('div');
            jobCardsContainer.className = 'job-results';

            data.results.forEach(job => {
                jobCardsContainer.appendChild(createJobCard(job));
            });

            jobsList.appendChild(jobCardsContainer);

            // Create pagination
            const paginationContainer = document.createElement('div');
            paginationContainer.className = 'pagination';
            const totalPages = Math.min(data.page_count, 10);

            for (let i = 1; i <= totalPages; i++) {
                const pageBtn = document.createElement('button');
                pageBtn.textContent = i;
                pageBtn.onclick = () => changePage(i);
                if (i === currentPage) pageBtn.classList.add('active');
                paginationContainer.appendChild(pageBtn);
            }

            jobsList.appendChild(paginationContainer);
        } else {
            jobsList.innerHTML = '<div class="no-results">No jobs found. Try different search criteria.</div>';
        }
    } catch (error) {
        console.error('Error:', error);
        jobsList.innerHTML = `<div class="error">Error fetching jobs: ${error.message}</div>`;
    }
}

function changePage(page) {
    currentPage = page;
    searchJobs();
}

// Event listeners for filters
jobTypeSelect.addEventListener('change', searchJobs);
experienceSelect.addEventListener('change', searchJobs);

// Event listeners
searchBtn.addEventListener('click', searchJobs);
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.replace('index.html');
        return;
    }
    document.getElementById('userName').textContent = currentUser.name;
    searchJobs();
    displaySavedJobs(); // Display saved jobs on load
});

function handleLogout() {
    localStorage.removeItem('currentUser');
    window.location.replace('index.html');
}


function displaySavedJobs() {
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    savedJobsList.innerHTML = ''; // Clear previous saved jobs

    if (savedJobs.length > 0) {
        const savedJobsContainer = document.createElement('div');
        savedJobsContainer.className = 'saved-jobs';
        savedJobs.forEach(job => {
            savedJobsContainer.appendChild(createJobCard(job));
        });
        savedJobsList.appendChild(savedJobsContainer);
    } else {
        savedJobsList.innerHTML = '<p>No saved jobs yet.</p>';
    }
}