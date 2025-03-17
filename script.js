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

// Default job listings that match the screenshot
const defaultJobs = [
    {
        title: "Software Developer Trainee",
        company: {
            display_name: "AKS Information Technology",
            logo: "https://ui-avatars.com/api/?name=AKS&background=random"
        },
        location: {
            display_name: "Noida"
        },
        lpa: "5 LPA",
        skills: ["Python", "HTML", "CSS", "JS", "React"],
        posted: "a day ago",
        expired: "40 minutes ago"
    },
    {
        title: "Full Stack Intern",
        company: {
            display_name: "Inkers Technology",
            logo: "https://ui-avatars.com/api/?name=Inkers&background=random"
        },
        location: {
            display_name: "Bangalore"
        },
        lpa: "4 LPA",
        skills: ["Python", "React", "Java", "Python Full Stack"],
        posted: "a day ago",
        expired: "3 hours ago"
    },
    {
        title: "ServiceNow Developer Intern",
        company: {
            display_name: "ITnow Inc",
            logo: "https://ui-avatars.com/api/?name=ITnow&background=random"
        },
        location: {
            display_name: "Bengaluru"
        },
        lpa: "3 LPA",
        skills: ["Java", "JavaScript"],
        posted: "5 days ago",
        expired: "4 days ago"
    },
    {
        title: "Associate Database Administrator (DBA)",
        company: {
            display_name: "Ahana Systems and Solutions",
            logo: "https://ui-avatars.com/api/?name=Ahana&background=random"
        },
        location: {
            display_name: "Mumbai, Bengaluru"
        },
        lpa: "2.40 LPA",
        skills: ["SQL", "Oracle", "Python"],
        posted: "6 days ago",
        expired: "5 days ago"
    },
    {
        title: "Trainee Tester & Functional Analyst",
        company: {
            display_name: "Infanion",
            logo: "https://ui-avatars.com/api/?name=Infanion&background=random"
        },
        location: {
            display_name: "Bangalore"
        },
        lpa: "3.50 LPA",
        skills: ["Core Java", "Manual Testing", "Automation Testing"],
        posted: "6 days ago",
        expired: "5 days ago"
    },
    {
        title: "SDET Intern",
        company: {
            display_name: "Townhall",
            logo: "https://ui-avatars.com/api/?name=Townhall&background=random"
        },
        location: {
            display_name: "Hyderabad"
        },
        lpa: "4 LPA",
        skills: ["Selenium", "Core Java", "Manual Testing"],
        posted: "7 days ago",
        expired: "6 days ago"
    }
];

// Event Listeners
searchBtn.addEventListener('click', () => {
    currentPage = 1;
    searchJobs();
});

// Function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Function to create job card
function createJobCard(job) {
    const bgClasses = ['peach', 'mint', 'lavender', 'sky', 'rose', 'cloud'];
    const randomBg = bgClasses[Math.floor(Math.random() * bgClasses.length)];
    
    const jobCard = document.createElement('div');
    jobCard.className = `job-card ${randomBg}`;
    
    // Format date
    const postedDate = new Date(job.publication_date || new Date());
    const formattedDate = postedDate.toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).replace(',', '');

    // Generate company logo text
    const companyInitials = job.company.display_name
        .split(' ')
        .map(word => word[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    // Generate tags from job data
    const tags = [];
    if (job.level) tags.push(job.level);
    if (job.type) tags.push(job.type);
    if (job.locations && job.locations.length > 0) {
        const locationName = job.locations[0].name;
        if (locationName.toLowerCase().includes('remote')) {
            tags.push('Remote');
        }
    }

    jobCard.innerHTML = `
        <div class="job-date">${formattedDate}</div>
        <button class="bookmark-btn">
            <i class="far fa-bookmark"></i>
        </button>
        <div class="company-header">
            <div class="company-logo">${companyInitials}</div>
            <h3 class="company-name">${job.company.display_name}</h3>
        </div>
        <h2 class="job-title">${job.title}</h2>
        <div class="job-tags">
            ${tags.map(tag => `<span class="job-tag">${tag}</span>`).join('')}
        </div>
        <div class="job-footer">
            <div class="job-location">
                ${job.locations ? job.locations.map(loc => loc.name).join(', ') : 'Location not specified'}
            </div>
            <a href="${job.refs.landing_page}" target="_blank" class="details-btn">Details</a>
        </div>
    `;

    // Add bookmark functionality
    const bookmarkBtn = jobCard.querySelector('.bookmark-btn');
    bookmarkBtn.addEventListener('click', (e) => {
        e.preventDefault();
        bookmarkBtn.classList.toggle('active');
        bookmarkBtn.innerHTML = bookmarkBtn.classList.contains('active') ? 
            '<i class="fas fa-bookmark"></i>' : 
            '<i class="far fa-bookmark"></i>';
    });

    return jobCard;
}

// Helper function to format time ago
function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return interval + ' years ago';
    
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return interval + ' months ago';
    
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return interval + ' days ago';
    
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return interval + ' hours ago';
    
    interval = Math.floor(seconds / 60);
    if (interval > 1) return interval + ' minutes ago';
    
    if(seconds < 10) return 'just now';
    
    return Math.floor(seconds) + ' seconds ago';
}

// Function to create pagination
function createPagination(totalPages) {
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination';
    
    let paginationHTML = `
        <button ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
    `;

    const maxPages = Math.min(totalPages, 10);
    for (let i = 1; i <= maxPages; i++) {
        paginationHTML += `
            <button class="${i === currentPage ? 'active' : ''}">${i}</button>
        `;
    }

    paginationHTML += `
        <button ${currentPage === maxPages ? 'disabled' : ''}>Next</button>
    `;

    paginationContainer.innerHTML = paginationHTML;

    // Add event listeners
    paginationContainer.querySelectorAll('button').forEach((button, index) => {
        button.addEventListener('click', () => {
            if (button.textContent === 'Previous' && currentPage > 1) {
                changePage(currentPage - 1);
            } else if (button.textContent === 'Next' && currentPage < maxPages) {
                changePage(currentPage + 1);
            } else if (button.textContent !== 'Previous' && button.textContent !== 'Next') {
                changePage(parseInt(button.textContent));
            }
        });
    });

    return paginationContainer.outerHTML;
}

// Function to change page
function changePage(page) {
    currentPage = page;
    searchJobs();
}

// Function to search jobs
async function searchJobs() {
    try {
        jobsList.innerHTML = '<div class="loading">Fetching jobs...</div>';

        const jobTitle = jobTitleInput.value.trim() || 'software developer';
        const location = locationInput.value.trim() || 'india';

        // The Muse API parameters
        const params = new URLSearchParams({
            page: currentPage,
            api_key: '32cb6f9130ff1dabf9c1b351645b544a821499806e8a7009be1dc892c4e97de3'
        });

        // Add optional parameters
        if (jobTitle) {
            params.append('q', jobTitle);
        }
        if (location && location !== 'all') {
            params.append('location', location);
        }
        if (jobTypeSelect.value) {
            params.append('level', jobTypeSelect.value);
        }
        if (experienceSelect.value) {
            params.append('category', experienceSelect.value);
        }

        const response = await fetch(`${BASE_URL}?${params}`);
        console.log('API Request URL:', `${BASE_URL}?${params}`);
        
        if (!response.ok) {
            const errorData = await response.text();
            console.error('API Error Response:', errorData);
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        if (data.results && data.results.length > 0) {
            const jobs = data.results.map(job => ({
                title: job.name,
                company: {
                    display_name: job.company.name,
                    logo: job.company.refs?.logo_image
                },
                locations: job.locations,
                publication_date: job.publication_date,
                refs: job.refs,
                level: job.levels[0]?.name || 'Entry Level',
                type: job.categories[0]?.name || 'Full Time'
            }));

            // Clear previous content
            jobsList.innerHTML = '';
            
            // Add results header
            const resultsHeader = document.createElement('div');
            resultsHeader.className = 'results-header';
            resultsHeader.innerHTML = `
                <div class="results-title">
                    <h2>Recommended jobs</h2>
                    <span class="job-count">${data.total || jobs.length}</span>
                </div>
                <div class="sort-options">
                    <span>Sort by:</span>
                    <select>
                        <option>Last updated</option>
                        <option>Most relevant</option>
                    </select>
                </div>
            `;
            jobsList.appendChild(resultsHeader);

            // Create job cards container
            const jobCardsContainer = document.createElement('div');
            jobCardsContainer.className = 'job-results';
            jobs.forEach(job => {
                jobCardsContainer.appendChild(createJobCard(job));
            });
            jobsList.appendChild(jobCardsContainer);

            // Create and append pagination
            const totalPages = Math.ceil(data.page_count);
            const paginationContainer = document.createElement('div');
            paginationContainer.className = 'pagination';
            paginationContainer.innerHTML = createPagination(totalPages);
            jobsList.appendChild(paginationContainer);
        } else {
            jobsList.innerHTML = '<div class="no-results">No jobs found. Try different search criteria.</div>';
        }
    } catch (error) {
        console.error('Error:', error);
        jobsList.innerHTML = `<div class="error">Error fetching jobs: ${error.message}</div>`;
    }
}

// Function to extract skills from job description
function extractSkillsFromDescription(description) {
    const commonSkills = [
        'Python', 'Java', 'JavaScript', 'React', 'Angular', 'Node.js',
        'HTML', 'CSS', 'SQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes',
        'Git', 'REST API', 'TypeScript', 'Vue.js', 'PHP', 'C++', 'C#',
        '.NET', 'Ruby', 'Swift', 'Kotlin', 'Android', 'iOS'
    ];
    
    const foundSkills = commonSkills.filter(skill => 
        description.toLowerCase().includes(skill.toLowerCase())
    );
    
    return foundSkills.length > 0 ? foundSkills : ['JavaScript', 'Python', 'Java'];
}

// Display initial jobs when page loads
document.addEventListener('DOMContentLoaded', searchJobs); 