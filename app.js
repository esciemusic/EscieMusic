/* ==========================================
   ESCIE // COMMAND HUB - MASTER APPLICATION SCRIPT
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. ROOM NAVIGATION SWITCHER --- */
    const navButtons = document.querySelectorAll('.nav-btn');
    const roomSections = document.querySelectorAll('.room-section');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetRoom = btn.getAttribute('data-target');

            navButtons.forEach(b => b.classList.remove('active'));
            roomSections.forEach(sec => sec.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(targetRoom).classList.add('active');
        });
    });


    /* --- 2. VAULT DATA & SYNCHRONIZED CAROUSEL --- */
    const vaultTracks = [
        { title: "B.A.M. // INTRO", subtitle: "Produced by Escie [B.A.M. Project]", category: "inst", art: "[ B.A.M. : INTRO ]" },
        { title: "Honey Trap", subtitle: "Chopper Flow / Drill Mix", category: "tracks", art: "[ B.A.M. : HONEY TRAP ]" },
        { title: "Mañana's Lullaby", subtitle: "Boom Bap Storytelling Master", category: "mix", art: "[ B.A.M. : MANANA ]" },
        { title: "On the Swivel", subtitle: "Dark Cinematic Instrumental", category: "inst", art: "[ B.A.M. : SWIVEL ]" },
        { title: "Crooked Locs (Remix)", subtitle: "Technical Rap Showcase", category: "tracks", art: "[ B.A.M. : CROOKED ]" },
        { title: "Little Italy Blueprint", subtitle: "Full Mastering Suite", category: "mix", art: "[ B.A.M. : RENTAL ]" }
    ];

    let currentTrackIndex = 0;
    const tracklistContainer = document.getElementById('vault-tracklist');
    const artworkDisplay = document.getElementById('vault-artwork');
    const carouselIndicator = document.getElementById('carousel-indicator');
    const marqueeText = document.getElementById('audio-marquee-text');

    function renderVaultTracks(filter = 'all') {
        tracklistContainer.innerHTML = '';
        vaultTracks.forEach((track, index) => {
            if (filter === 'all' || track.category === filter || (filter === 'inst' && track.category === 'instrumentals')) {
                const card = document.createElement('div');
                card.className = 'track-item-card';
                card.innerHTML = `
                    <div class="track-info">
                        <h4>${track.title}</h4>
                        <p>${track.subtitle}</p>
                    </div>
                    <button class="tactile-btn">LOAD</button>
                `;
                card.addEventListener('click', () => {
                    currentTrackIndex = index;
                    updateActiveTrackState();
                });
                tracklistContainer.appendChild(card);
            }
        });
    }

    function updateActiveTrackState() {
        const track = vaultTracks[currentTrackIndex];
        artworkDisplay.innerHTML = `<span class="artwork-text">${track.art}</span>`;
        carouselIndicator.textContent = `0${currentTrackIndex + 1} / 0${vaultTracks.length}`;
        marqueeText.textContent = `ESCIE // S.C. — NOW PLAYING: ${track.title.toUpperCase()} [${track.subtitle.toUpperCase()}] ACTIVE STREAM...`;
    }

    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderVaultTracks(e.target.getAttribute('data-category'));
        });
    });

    document.getElementById('carousel-prev').addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex - 1 + vaultTracks.length) % vaultTracks.length;
        updateActiveTrackState();
    });

    document.getElementById('carousel-next').addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex + 1) % vaultTracks.length;
        updateActiveTrackState();
    });

    renderVaultTracks();
    updateActiveTrackState();


    /* --- 3. VISUALS GALLERY & HERO STAGE --- */
    const visualsGallery = document.getElementById('visuals-gallery');
    const heroVideoContainer = document.getElementById('hero-video-container');

    const galleryItems = [
        { title: "B.A.M. Teaser Reel 01", type: "video", embed: "https://www.youtube.com/embed/placeholder1" },
        { title: "Little Italy Session Still", type: "photo", img: "photo1" },
        { title: "Live Studio Hardware Rig", type: "photo", img: "photo2" },
        { title: "Mañana's Lullaby Visualizer", type: "video", embed: "https://www.youtube.com/embed/placeholder2" }
    ];

    galleryItems.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'gallery-card';
        card.innerHTML = `<span class="mono-label">[ ${item.title.toUpperCase()} ]</span>`;
        card.addEventListener('click', () => {
            if (item.type === 'video') {
                heroVideoContainer.innerHTML = `<iframe width="100%" height="100%" src="${item.embed}" title="${item.title}" frameborder="0" allowfullscreen></iframe>`;
            } else {
                heroVideoContainer.innerHTML = `<div class="artwork-placeholder"><span class="artwork-text">[ VIEWING: ${item.title.toUpperCase()} ]</span></div>`;
            }
        });
        visualsGallery.appendChild(card);
    });


    /* --- 4. EPK DOSSIER & ASSETS --- */
    const bios = {
        short: "Escie (S.C.) is an independent Montreal-based rap artist and master producer specializing in technical hip-hop, rapid chopper flows, and dark underground atmospheres.",
        medium: "Emerging from Montreal's Little Italy and Park-Extension roots (formerly known as Seth Clark 8118), Escie engineers his own boundary-pushing sound—fusing horrorcore, drill, boom-trap, and intricate multisyllabic storytelling.",
        long: "Escie (S.C. / Sivv Evolution of The Hellraizer Crooked Loc Aka Rosko Korentos) represents an uncompromising, hyper-technical approach to modern hip-hop production and lyricism. Writing, producing, mixing, and mastering entirely in-house using FL Studio custom architecture, his upcoming B.A.M. (By Any Means) project delivers rapid-fire cadences, dense rhyme schemes, and dark cinematic soundscapes forged in Montreal's underground."
    };

    const bioDisplayText = document.getElementById('bio-display-text');
    bioDisplayText.textContent = bios.short;

    document.querySelectorAll('.bio-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.bio-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            bioDisplayText.textContent = bios[e.target.getAttribute('data-bio')];
        });
    });

    document.getElementById('download-rider-pdf').addEventListener('click', () => {
        alert("Generating secure Technical Rider & Stage Plot dossier (.PDF)...");
    });

    document.getElementById('copy-booking-email').addEventListener('click', () => {
        navigator.clipboard.writeText("booking@esciemusic.com");
        const btn = document.getElementById('copy-booking-email');
        btn.textContent = "COPIED TO CLIPBOARD!";
        setTimeout(() => btn.textContent = "COPY MANAGEMENT EMAIL", 2500);
    });


    /* --- 5. CONTACTS CAROUSEL --- */
    const contactsData = [
        { platform: "SOUNDCLOUD", handle: "@escie_sc", status: "[ STREAMING ACTIVE ]", link: "https://soundcloud.com" },
        { platform: "INSTAGRAM", handle: "@esciemusic", status: "[ VISUAL FEED ]", link: "https://instagram.com" },
        { platform: "YOUTUBE", handle: "Escie Official", status: "[ VIDEO ARCHIVE ]", link: "https://youtube.com" },
        { platform: "DIRECT EMAIL", handle: "contact@esciemusic.com", status: "[ OPEN FOR COLLABS ]", link: "mailto:contact@esciemusic.com" }
    ];

    let currentContactIndex = 0;
    const contactsCarousel = document.getElementById('contacts-carousel');

    function renderContactsCard() {
        const contact = contactsData[currentContactIndex];
        contactsCarousel.innerHTML = `
            <div class="contact-card">
                <span class="mono-label">${contact.status}</span>
                <h3>${contact.platform}</h3>
                <p class="room-subtitle">${contact.handle}</p>
                <a href="${contact.link}" target="_blank" class="tactile-btn" style="margin-top: 1rem; display: inline-block;">OPEN LINK &rarr;</a>
            </div>
        `;
    }

    document.getElementById('contact-prev').addEventListener('click', () => {
        currentContactIndex = (currentContactIndex - 1 + contactsData.length) % contactsData.length;
        renderContactsCard();
    });

    document.getElementById('contact-next').addEventListener('click', () => {
        currentContactIndex = (currentContactIndex + 1) % contactsData.length;
        renderContactsCard();
    });

    renderContactsCard();


    /* --- 6. SUPABASE CHAT BOARD INTEGRATION --- */
    // Note: Replace with your actual Supabase project URL and anon key when deploying live
    const SUPABASE_URL = "https://your-supabase-project.supabase.co";
    const SUPABASE_ANON_KEY = "your-supabase-anon-key";
    
    let supabaseClient = null;
    try {
        if (window.supabase && SUPABASE_URL !== "https://your-supabase-project.supabase.co") {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
    } catch (err) {
        console.log("Supabase initialization pending configuration.");
    }

    const chatFeed = document.getElementById('supabase-chat-feed');
    const chatForm = document.getElementById('chat-submit-form');
    const userHandleInput = document.getElementById('chat-user-handle');
    const messageInput = document.getElementById('chat-message-text');

    // Local fallback chat array if Supabase isn't keyed yet
    const localChatBuffer = [
        { handle: "S.C.", message: "B.A.M. project rolling out soon. Stay locked to the frequency.", time: "Just now" },
        { handle: "Listener_04", message: "That instrumental mix goes hard. Clean production.", time: "2m ago" }
    ];

    function renderChatFeed() {
        chatFeed.innerHTML = '';
        localChatBuffer.forEach(msg => {
            const div = document.createElement('div');
            div.className = 'chat-msg';
            div.innerHTML = `
                <div>
                    <span class="msg-user">[${msg.handle}]</span>
                    <span class="msg-time">${msg.time}</span>
                </div>
                <span class="msg-text">${msg.message}</span>
            `;
            chatFeed.appendChild(div);
        });
        chatFeed.scrollTop = chatFeed.scrollHeight;
    }

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const handle = userHandleInput.value.trim();
        const text = messageInput.value.trim();

        if (handle && text) {
            localChatBuffer.push({ handle: handle, message: text, time: "Just now" });
            renderChatFeed();
            messageInput.value = '';
        }
    });

    renderChatFeed();


    /* --- 7. TOOLS RACK CAROUSEL & CALCULATORS --- */
    const toolModules = document.querySelectorAll('.tool-module');
    let currentToolIndex = 0;

    function updateToolRack() {
        toolModules.forEach((mod, idx) => {
            mod.classList.toggle('active', idx === currentToolIndex);
        });
    }

    document.getElementById('tool-prev').addEventListener('click', () => {
        currentToolIndex = (currentToolIndex - 1 + toolModules.length) % toolModules.length;
        updateToolRack();
    });

    document.getElementById('tool-next').addEventListener('click', () => {
        currentToolIndex = (currentToolIndex + 1) % toolModules.length;
        updateToolRack();
    });

    // Tool 1: Delay & Reverb Calculator Logic
    const bpmInput = document.getElementById('calc-bpm');
    const resQuarter = document.getElementById('res-quarter');
    const resEighth = document.getElementById('res-eighth');
    const resPredelay = document.getElementById('res-predelay');

    function calculateDelays() {
        const bpm = parseFloat(bpmInput.value) || 120;
        const quarterMs = Math.round(60000 / bpm);
        const eighthMs = Math.round(quarterMs / 2);
        const predelayMs = Math.round(quarterMs / 32); // Approximate standard reverb predelay

        resQuarter.textContent = `${quarterMs}ms`;
        resEighth.textContent = `${eighthMs}ms`;
        resPredelay.textContent = `${predelayMs}ms`;
    }

    bpmInput.addEventListener('input', calculateDelays);
    calculateDelays();

    // Tool 2: Syllable Analyzer Logic
    const lyricInput = document.getElementById('lyric-input-box');
    const metricSyllables = document.getElementById('metric-syllables');
    const metricCadence = document.getElementById('metric-cadence');

    lyricInput.addEventListener('input', () => {
        const text = lyricInput.value.trim();
        if (!text) {
            metricSyllables.textContent = "0";
            metricCadence.textContent = "--";
            return;
        }
        // Simple vowel-group estimation for syllables
        const words = text.split(/\s+/).length;
        const vowels = text.match(/[aeiouyAEIOUY]/g);
        const count = vowels ? vowels.length : 0;

        metricSyllables.textContent = count;
        metricCadence.textContent = count > 14 ? "RAPID / CHOPPER" : "STANDARD BOOM BAP";
    });

    // Tool 3: Key / Scale Reference Logic
    const scaleRootSelect = document.getElementById('scale-root');
    const scaleNotesDisplay = document.getElementById('scale-notes-display');

    const scalesMap = {
        "C": "C, D, D#, F, G, G#, A# (Natural Minor / C Minor)",
        "C#": "C#, D#, E, F#, G#, A, B (Natural Minor)",
        "D": "D, E, F, G, A, A#, C (Natural Minor)",
        "D#": "D#, F, F#, G#, A#, B, C# (Natural Minor)",
        "E": "E, F#, G, A, B, C, D (Natural Minor)",
        "F": "F, G, G#, A#, C, C#, D# (Natural Minor)",
        "F#": "F#, G#, A, B, C#, D, E (Natural Minor)",
        "G": "G, A, A#, C, D, D#, F (Natural Minor)",
        "G#": "G#, A#, B, C#, D#, E, F# (Natural Minor)",
        "A": "A, B, C, D, E, F, G (Natural Minor Standard)",
        "A#": "A#, C, C#, D#, F, F#, G# (Natural Minor)",
        "B": "B, C#, D, E, F#, G, A (Natural Minor)"
    };

    scaleRootSelect.addEventListener('change', (e) => {
        const root = e.target.value;
        scaleNotesDisplay.textContent = `Notes: ${scalesMap[root] || "Standard Scale Reference"}`;
    });


    /* --- 8. MOVABLE & COLLAPSIBLE AUDIO CONSOLE PHYSICS --- */
    const consoleChassis = document.getElementById('audio-console');
    const consoleDragHandle = document.getElementById('console-drag-handle');
    const consoleCollapseBtn = document.getElementById('console-collapse-btn');

    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    consoleDragHandle.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = consoleChassis.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;

        // Switch from fixed bottom/right to explicit pixel positioning for smooth drag
        consoleChassis.style.bottom = 'auto';
        consoleChassis.style.right = 'auto';
        consoleChassis.style.left = `${initialLeft}px`;
        consoleChassis.style.top = `${initialTop}px`;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        consoleChassis.style.left = `${initialLeft + dx}px`;
        consoleChassis.style.top = `${initialTop + dy}px`;
    }

    function onMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    // Collapse / Expand Toggle
    consoleCollapseBtn.addEventListener('click', () => {
        consoleChassis.classList.toggle('collapsed');
        consoleCollapseBtn.textContent = consoleChassis.classList.contains('collapsed') ? '+' : '_';
    });

});
