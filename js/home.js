document.addEventListener('DOMContentLoaded', () => {
    const loggedInUser = localStorage.getItem('loggedInUser');

    if (!loggedInUser) {
        document.body.style.display = 'none';
        Swal.fire({
            title: 'גישה חסומה!',
            text: 'נא להתחבר למערכת כדי לתכנן טיולים.',
            icon: 'error',
            confirmButtonText: 'להתחברות עכשיו',
            confirmButtonColor: '#e1b12c'
        }).then(() => {
            window.location.href = 'login.html';
        });
        return;
    }

    const welcomeElement = document.getElementById('welcome-user');
    if (welcomeElement) {
        welcomeElement.innerHTML = `שלום <b>${loggedInUser}</b>, לאן מטיילים היום?`;
    }

    initMap();

    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (themeIcon) {
            themeIcon.className = 'fa-solid fa-sun';
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            let theme = document.documentElement.getAttribute('data-theme');
            if (theme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                if (themeIcon) themeIcon.className = 'fa-solid fa-moon';
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                if (themeIcon) themeIcon.className = 'fa-solid fa-sun';
            }
        });
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            Swal.fire({
                title: 'להתנתק מהמערכת?',
                text: "תמיד תוכל להתחבר שוב בקלות!",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'כן, התנתק',
                cancelButtonText: 'ביטול'
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.removeItem('loggedInUser');
                    window.location.href = 'login.html';
                }
            });
        });
    }

    // חלונית היסטוריית הטיולים
    const historyModal = document.getElementById('history-modal');
    const historyToggleBtn = document.getElementById('history-toggle');
    const closeModalBtn = document.getElementById('close-modal-btn');

    if (historyToggleBtn && historyModal) {
        historyToggleBtn.addEventListener('click', () => {
            historyModal.style.display = 'flex'; 
            loadUserTrips(); 
        });
    }

    if (closeModalBtn && historyModal) {
        closeModalBtn.addEventListener('click', () => {
            historyModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === historyModal) {
            historyModal.style.display = 'none';
        }
    });


    //ניהול הפיצ'רים הנוספים במסך הבית
    const widgetBtn = document.getElementById('travel-widget-btn');      
    const widgetPopup = document.getElementById('travel-widget-popup');  
    const widgetTitle = document.getElementById('widget-title');
    const widgetText = document.getElementById('widget-text-content');
    const widgetNextBtn = document.getElementById('widget-next-btn');

    const triggerBtn = document.getElementById('spontaneous-trigger-btn'); 
    const spontPopup = document.getElementById('spontaneous-popup');     
    const runBtn = document.getElementById('run-spontaneous-btn');        

    const emergencyTrigger = document.getElementById('emergency-trigger-btn'); 
    const emergencyPopup = document.getElementById('emergency-popup');          


    function getRandomTip() {
        if (!widgetTitle || !widgetText) return;
        const randomIndex = Math.floor(Math.random() * travelTipsAndGear.length);
        const item = travelTipsAndGear[randomIndex];
        widgetTitle.innerHTML = item.type === "gear" ? "🎒 שלא תעז לשכוח:" : "💡 טיפ מנצח לדרך:";
        widgetText.textContent = item.text;
    }

    if (widgetBtn && widgetPopup) {
        widgetBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (spontPopup) spontPopup.style.display = 'none';
            if (emergencyPopup) emergencyPopup.style.display = 'none';

            if (widgetPopup.style.display === 'block') {
                widgetPopup.style.display = 'none';
            } else {
                getRandomTip();
                widgetPopup.style.display = 'block';
            }
        });
    }

    if (widgetNextBtn) {
        widgetNextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            getRandomTip();
        });
    }

    if (triggerBtn && spontPopup && runBtn) {
        triggerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (widgetPopup) widgetPopup.style.display = 'none';
            if (emergencyPopup) emergencyPopup.style.display = 'none';

            if (spontPopup.style.display === 'block') {
                spontPopup.style.display = 'none';
            } else {
                spontPopup.style.display = 'block';
            }
        });


        runBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            spontPopup.style.display = 'none';

            const optionsMap = {
                'region': ["צפון והגליל", "מרכז וגוש דן", "דרום והנגב", "ירושלים והסביבה"],
                'trip-style': ["טבע ומעיינות", "עירוני ותרבות", "אקסטרים ואתגרים", "בטן-גב ורוגע"],
                'difficulty': ["קל (מתאים למשפחות)", "בינוני (למיטיבי לכת לייט)", "קשה (למקצוענים ואתגרי)"],
                'budget': ["לואו קוסט (חינמי / זול)", "ממוצע (סביר והגיוני)", "פינוק (אטרקציות ומסעדות)"],
                'weather': ["מתאים לכל מזג אוויר", "יום שמש חם (מוצל/מים)", "יום קריר / חורפי (מקורה)"]
            };

            Object.keys(optionsMap).forEach(id => {
                const selectElement = document.getElementById(id);
                if (selectElement) {
                    const arr = optionsMap[id];
                    selectElement.value = arr[Math.floor(Math.random() * arr.length)];
                }
            });

            const formRows = document.querySelectorAll('.form-row');
            formRows.forEach(row => {
                row.style.transition = 'all 0.3s ease';
                row.style.opacity = '0.3';
                setTimeout(() => row.style.opacity = '1', 300);
            });

            const tripForm = document.getElementById('trip-parameters-form') || document.getElementById('trip-form') || document.querySelector('form');
            if (tripForm) {
                setTimeout(() => {
                    tripForm.dispatchEvent(new Event('submit'));
                }, 500);
            }
        });
    }

    if (emergencyTrigger && emergencyPopup) {
        emergencyTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (widgetPopup) widgetPopup.style.display = 'none';
            if (spontPopup) spontPopup.style.display = 'none';

            if (emergencyPopup.style.display === 'block') {
                emergencyPopup.style.display = 'none';
            } else {
                emergencyPopup.style.display = 'block';
            }
        });
    }

    document.addEventListener('click', (e) => {
        if (widgetPopup && widgetPopup.contains(e.target)) return;
        if (spontPopup && spontPopup.contains(e.target)) return;
        if (emergencyPopup && emergencyPopup.contains(e.target)) return;

        if (widgetPopup) widgetPopup.style.display = 'none';
        if (spontPopup) spontPopup.style.display = 'none';
        if (emergencyPopup) emergencyPopup.style.display = 'none';
    });
});

// פונקציות היסטורית הטיולים
async function loadUserTrips() {
    const username = localStorage.getItem('loggedInUser');
    if (!username) return;

    try {
        const response = await fetch(`/api/my-trips/${username}`);
        const trips = await response.json();
        const list = document.getElementById('trips-list');
        
        if (!list) return;

        const oldClearBtn = document.getElementById('clear-history-btn');
        if (oldClearBtn) oldClearBtn.remove();
        const oldConfirmBox = document.getElementById('custom-confirm-box');
        if (oldConfirmBox) oldConfirmBox.remove();

        if (trips.length === 0) {
            list.innerHTML = `<li style="text-align: center; color: #888; padding: 20px;">אין לך עדיין טיולים שמורים. צא לדרך ותכנן אחד! </li>`;
            return;
        }

        list.innerHTML = ''; 

        trips.forEach((trip) => {
            const li = document.createElement('li');
            const dateObj = new Date(trip.createdAt);
            const date = dateObj.toLocaleDateString('he-IL');
            const time = dateObj.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
            
            const button = document.createElement('button');
            button.className = 'nav-btn';
            button.style.width = '100%';
            button.style.display = 'flex';
            button.style.alignItems = 'center';
            button.style.borderColor = '#f1c152';
            button.style.marginBottom = '10px'; 
            button.style.padding = '10px 15px'; 
            
            button.innerHTML = `
                <span style="font-weight: bold; text-align: right;"> טיול ל${trip.region}</span>
                <span style="margin-right: auto; font-size: 11px; opacity: 0.7; direction: ltr; text-align: left; white-space: nowrap;">
                    ${date} <span style="margin-left: 5px; color: #e1b12c;"> ${time}</span>
                </span>
            `;
            
            button.addEventListener('click', () => {
                if (typeof window.showSavedTrip === 'function') {
                    window.showSavedTrip(encodeURIComponent(trip.itinerary), encodeURIComponent(trip.region));
                    const modal = document.getElementById('history-modal');
                    if (modal) {
                        modal.style.display = 'flex';
                        button.style.backgroundColor = 'rgba(241, 193, 82, 0.2)';
                        setTimeout(() => {
                            modal.style.display = 'none';
                            button.style.backgroundColor = '';
                        }, 2000);
                    }
                }
            });
            
            li.appendChild(button);
            list.appendChild(li);
        });

        const clearBtn = document.createElement('button');
        clearBtn.id = 'clear-history-btn';
        clearBtn.className = 'clear-history-btn'; 
        clearBtn.innerHTML = `<i class="fa-solid fa-trash-can"></i> ניקוי כל ההיסטוריה`;
        
        clearBtn.addEventListener('click', () => {
            if (document.getElementById('custom-confirm-box')) return;

            const confirmBox = document.createElement('div');
            confirmBox.id = 'custom-confirm-box';
            confirmBox.className = 'custom-confirm-box'; 
            
            confirmBox.innerHTML = `
                <p class="confirm-title-text">בטוח/ה שברצונך למחוק את כל ההיסטוריה לחלוטין?</p>
                <div class="confirm-actions-div">
                    <button id="confirm-yes" class="confirm-btn-yes">כן, למחוק</button>
                    <button id="confirm-no" class="confirm-btn-no">ביטול</button>
                </div>
            `;

            list.parentNode.insertBefore(confirmBox, list.nextSibling);

            document.getElementById('confirm-no').addEventListener('click', () => confirmBox.remove());

            document.getElementById('confirm-yes').addEventListener('click', async () => {
                try {
                    const deleteResponse = await fetch(`/api/my-trips/${username}`, {
                        method: 'DELETE'
                    });
                    
                    if (deleteResponse.ok) {
                        confirmBox.innerHTML = `<p class="confirm-success-text">ההיסטוריה נמחקה בהצלחה! </p>`;
                        setTimeout(() => {
                            loadUserTrips(); 
                        }, 1500);
                    } else {
                        confirmBox.innerHTML = `<p class="confirm-title-text">שגיאה במחיקת ההיסטוריה.</p>`;
                    }
                } catch (err) {
                    console.error("שגיאה בתקשורת עם השרת:", err);
                }
            });
        });

        list.parentNode.insertBefore(clearBtn, list.nextSibling);

    } catch (error) {
        console.error("שגיאה בטעינת היסטוריית הטיולים:", error);
    }
}


window.showSavedTrip = async function(encodedItinerary, encodedRegion) {
    const itineraryText = decodeURIComponent(encodedItinerary);
    const regionText = decodeURIComponent(encodedRegion);
    const itineraryBox = document.getElementById('itinerary-box') || document.getElementById('trip-output');
    
    if (itineraryBox) {
        const regionSelect = document.getElementById('region');
        if (regionSelect && regionText) {
            regionSelect.value = regionText;
        }

        mapMarkers.forEach(marker => map.removeLayer(marker));
        mapMarkers = [];
        if (routeLine) { map.removeLayer(routeLine); routeLine = null; }

        let cleanAiText = itineraryText; 

        if (itineraryText.includes("מיקומים למפה:")) {
            const parts = itineraryText.split("מיקומים למפה:");
            cleanAiText = parts[0]; 
            const placesString = parts[1]; 
            const placesArray = placesString.split(',').map(p => p.trim());
            
            let coordinates = [];
            for (let place of placesArray) {
                if (place) {
                    const coord = await addPlaceToMap(place);
                    if (coord) coordinates.push(coord);
                }
            }

            if (coordinates.length > 0) {
                const latLngs = coordinates.map(c => [c.lat, c.lon]);
                routeLine = L.polyline(latLngs, {
                    color: '#408548', weight: 3, opacity: 0.7, dashArray: '5, 10' 
                }).addTo(map);
                const bounds = L.latLngBounds(latLngs);
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }

        let formattedHtml = typeof marked !== 'undefined' ? marked.parse(cleanAiText) : cleanAiText.replace(/\n/g, "<br>");
        
        itineraryBox.style.position = 'relative';
        itineraryBox.innerHTML = `
            <button class="copy-btn" id="copy-itinerary-btn"><i class="fa-solid fa-copy"></i> העתק מסלול</button>
            <button class="whatsapp-btn" id="whatsapp-share-btn"><i class="fa-brands fa-whatsapp"></i> שתף בוואטסאפ</button>
            <div class="fade-in-effect" style="text-align: right; width: 100%; height: 100%; overflow-y: auto; padding: 15px; padding-top: 45px; direction: rtl;">
                <div style="line-height: 1.6; font-size: 15px;">${formattedHtml}</div>
            </div>
        `;
        
        setupActionButtons(cleanAiText);
        
        document.getElementById('history-modal').style.display = 'none';
        itineraryBox.scrollIntoView({ behavior: 'smooth' });
    }
};


function setupActionButtons(text) {
    const copyBtn = document.getElementById('copy-itinerary-btn');
    const waBtn = document.getElementById('whatsapp-share-btn');
    
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            navigator.clipboard.writeText(text).then(() => {
                this.innerHTML = `<i class="fa-solid fa-check"></i> הועתק!`;
                setTimeout(() => this.innerHTML = `<i class="fa-solid fa-copy"></i> העתק מסלול`, 2000);
            });
        });
    }
    if (waBtn) {
        waBtn.addEventListener('click', function() {
            window.open(`https://wa.me/?text=${encodeURIComponent("היי! תראו את מסלול הטיול המגניב שתיכננתי לנו:\n\n" + text)}`, '_blank');
        });
    }
}


//  פונקציות המפה 
let map;
let mapMarkers = [];
let routeLine = null;


function initMap() {
    const mapBox = document.getElementById('map-box');
    if (!mapBox || map) return; 

    mapBox.innerHTML = ''; 
    map = L.map('map-box').setView([31.5, 34.8], 8); 
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}


async function addPlaceToMap(placeName) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    try {
        const cleanPlace = placeName.trim();
        if (!cleanPlace) return null;

        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanPlace)}&countrycodes=il&limit=1&email=odeya-trip-app@example.com`;
        
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId); 

        const data = await response.json();

        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            
            const marker = L.marker([lat, lon]).addTo(map).bindPopup(`<b>${cleanPlace}</b>`);
            if (typeof mapMarkers !== 'undefined') mapMarkers.push(marker);
            
            return { lat, lon };
        }
        
        return null; 
    } catch (error) {
        clearTimeout(timeoutId);
        console.log(`עקפנו תקיעה או שגיאה עבור המיקום: ${placeName}`);
        return null; 
    }
}


document.getElementById('trip-parameters-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const region = document.getElementById('region').value;
    const tripStyle = document.getElementById('trip-style').value;
    const difficulty = document.getElementById('difficulty').value;
    const budget = document.getElementById('budget').value;
    const weather = document.getElementById('weather').value;
    const itineraryBox = document.getElementById('itinerary-box');

    if (itineraryBox) {
        itineraryBox.innerHTML = `
            <div class="loading-container" style="text-align: center; padding: 20px;">
                <i class="fa-solid fa-gear fa-spin" style="font-size: 50px; color: #2ecc71; margin-bottom: 15px;"></i>
                <h3 style="margin: 10px 0 5px 0; color: #333;">מנתח ומייצר מסלול...</h3>
                <p style="color: #666; font-size: 14px;">מכין את המסלול עבורכם!</p>
            </div>
        `;
    }

    const prompt = `אתה מדריך טיולים ישראלי צעיר, מגניב, זורם ומלא אנרגיה. 
      בנה תוכנית טיול יומית קצרה, הגיונית וברורה לפי הפרמטרים הבאים:
      אזור בארץ: ${region}, סגנון טיול: ${tripStyle}, רמת קושי: ${difficulty}, תקציב: ${budget}, מזג אוויר: ${weather}.`;
    
    try {
        console.log("פונה לשרת ה-Backend המאובטח בסטרימינג...");
        const response = await fetch("/api/generate-trip", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                prompt: prompt,
                username: localStorage.getItem('loggedInUser'),
                region: region
            })
        });

        if (!response.ok) {
            throw new Error("השרת החזיר שגיאה");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let accumulatedText = "";

        if (itineraryBox) {
            itineraryBox.style.position = 'relative';
            itineraryBox.innerHTML = `
                <button class="copy-btn" id="copy-itinerary-btn"><i class="fa-solid fa-copy"></i> העתק מסלול</button>
                <button class="whatsapp-btn" id="whatsapp-share-btn"><i class="fa-brands fa-whatsapp"></i> שתף בוואטסאפ</button>
                <div class="fade-in-effect" style="text-align: right; width: 100%; height: 100%; overflow-y: auto; padding: 15px; padding-top: 45px; direction: rtl;">
                    <div id="streaming-text" style="line-height: 1.6; font-size: 15px; white-space: pre-line;"></div>
                </div>
            `;
        }
        
        const textContainer = document.getElementById('streaming-text');

        mapMarkers.forEach(marker => map.removeLayer(marker));
        mapMarkers = [];
        if (routeLine) { map.removeLayer(routeLine); routeLine = null; }

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.trim().startsWith('data: ')) {
                    if (line.includes('[DONE]')) continue;
                    try {
                        const jsonStr = line.replace('data: ', '').trim();
                        const parsed = JSON.parse(jsonStr);
                        const textPiece = parsed.choices[0]?.delta?.content || "";
                        
                        accumulatedText += textPiece;
                        
                        let displayBoxText = accumulatedText;
                        if (accumulatedText.includes("מיקומים למפה:")) {
                            displayBoxText = accumulatedText.split("מיקומים למפה:")[0];
                        }

                        if (textContainer) {
                            if (typeof marked !== 'undefined') {
                                textContainer.innerHTML = marked.parse(displayBoxText);
                            } else {
                                textContainer.textContent = displayBoxText;
                            }
                        }
                    } catch (e) {}
                }
            }
        }

        let cleanAiText = accumulatedText;
        let placesArray = [];

        if (accumulatedText.includes("מיקומים למפה:")) {
            const parts = accumulatedText.split("מיקומים למפה:");
            cleanAiText = parts[0]; 
            const placesString = parts[1];
            placesArray = placesString.split(',').map(p => p.trim());
        }

        setupActionButtons(cleanAiText);

        async function processPlaces() {
            let coordinates = [];
            for (let place of placesArray) {
                if (place) {
                    const coord = await addPlaceToMap(place);
                    if (coord) coordinates.push([coord.lat, coord.lon]);
                    await new Promise(resolve => setTimeout(resolve, 1000)); 
                }
            }

            if (coordinates.length > 0) {
                routeLine = L.polyline(coordinates, {
                    color: '#408548',
                    weight: 3,
                    opacity: 0.7,
                    dashArray: '5, 10'
                }).addTo(map);
                
                map.fitBounds(routeLine.getBounds());
            }
        }

        processPlaces();

    } catch (err) {
        console.error("שגיאה בתהליך הסטרימינג:", err);
        if (itineraryBox) {
            itineraryBox.innerHTML = `
                <div class="placeholder-content">
                    <i class="fa-solid fa-triangle-exclamation" style="color: #e74c3c;"></i>
                    <h3>שגיאה בקבלת הנתונים</h3>
                    <p>אנא ודאו ששרת ה-Backend שלכם פועל כסדרו ונסו שוב</p>
                </div>
            `;
        }
    }
});

// מאגר הטיפים והציוד 
const travelTipsAndGear = [
    { type: "gear", text: "שים כובע על הראש וקח משקפי שמש. השמש בחוץ לא מרחמת!" },
    { type: "gear", text: "תמרח קרם הגנה לפני שיוצאים מהרכב." },
    { type: "gear", text: "תביא איתך משחק למשפחה (קלפים, טריוויה וכאלה) לזמן שנחים בצל." },
    { type: "gear", text: "אל תשכח כריות לנסיעה ארוכה כדי שהחבר'ה מאחורה לא יתלוננו." },
    { type: "gear", text: "וודא שהארנק איתך: תעודת זהות, רישיון וקצת מזומן למקרה שאין קליטה באשראי." },
    { type: "gear", text: "קח נעליים סגורות וטובות להליכה, ושים בתיק גם נעליים שמתאימות למים." },
    { type: "gear", text: "תכין מראש מגבת ובגדי החלפה, שלא תצטרך לנסוע רטוב כל הדרך חזרה." },
    { type: "gear", text: "תעמיס מחצלת לאוטו. אין כמו לפרוס אותה מתחת לאיזה עץ זית." },
    { type: "gear", text: "אל תשכח בקבוק מים קרים (והדגש הוא על קרים!). תשתו המון." },
    { type: "gear", text: "קח מטען נייד (פאוורבנק). המפה וה-AI יגמרו לך את הסוללה ברגע." },
    { type: "gear", text: "תדאג לחטיפים ולנשנושים בדרך, טיולים תמיד פותחים את התיאבון." },
    { type: "gear", text: "שים בתיק שקית ניילון ריקה לבגדים המלוכלכים או הרטובים, שלא יהרסו את התיק." },
    { type: "gear", text: "תביא איתך בעיקר מצב רוח טוב! כל השאר כבר יסתדר." },
    { type: "tip", text: "תקפיא בקבוק מים חצי מלא באלכסון בלילה שלפני, ובבוקר תמלא אותו. יהיו לך מים קפואים לכל היום!" },
    { type: "tip", text: "שקיות זיפלוק (Ziploc) מעולות כדי לשמור על הטלפון והמפתחות של הרכב מפני מים ואבק בשטח." },
    { type: "tip", text: "אם נוסעים לאזור בלי קליטה (כמו מדבר יהודה או נחלים עמוקים), תוריד את המפה מראש בגוגל מאפס לשימוש אופליין." },
    { type: "tip", text: "כשאתה מחנה את הרכב במסלול בקיץ, כסה את אבזם חגורת הבטיחות עם חולצה או מגבת כדי למנוע כווייה כשתחזור." },
    { type: "tip", text: "אם הגעתם למעיין חבוי ויש סביבו המון דבורים או צרעות, הן לרוב רק צמאות למים ולא יתקפו אם לא תציקו להן. פשוט היכנסו למים בשקט." },
    { type: "tip", text: "כדאי שתהיה לכם באוזן אפליקציית 'עמוד ענן' או 'Israel Hiking Map' כדי לוודא שאתם לא סוטים משבילים מסומנים." },
    { type: "tip", text: "מצאתם זבל של מישהו אחר במסלול? הרימו אותו איתכם. הטבע שלנו קטן ויקר, ובואו נשמור עליו נקי." },
    { type: "tip", text: "בקיץ הישראלי, המסלולים שאינם מסלולי מים הופכים למסוכנים בצהריים. תתחילו מוקדם בבוקר, ב-7:00 כבר תהיו בשטח." },
    { type: "tip", text: "אם הטיול שלכם כולל עצירה במסעדה מפורסמת בצפון או בדרום ביום שבת, הזמינו מקום עוד ביום חמישי כי הכל מתמלא בשנייה." },
    { type: "tip", text: "לעולם אל תיכנסו למערות או בורות מים לא מסומנים באזורי ספר – חלקם עלולים להכיל גזים רעילים או קרציות מערות." },
    { type: "tip", text: "השתמשו באפליקציית 'עילם' או ב-Google Lens כדי לזהות פרחים וצמחים מיוחדים שאתם פוגשים בדרך." },
    { type: "tip", text: "אם אתם נשארים לקמפינג או טיול שקיעה ליד מקור מים, מרחו חומר נגד יתושים עוד לפני שמתחיל להחשיך." },
    { type: "tip", text: "חוזרים מהצפון בשבת אחה'צ? תכננו את העצירה לארוחת ערב קרוב לאזור הטיול, וצאו לכיוון המרכז רק אחרי 20:30 כשהכבישים מתפנים." }
];