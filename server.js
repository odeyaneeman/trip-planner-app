const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname)));
app.use(express.json());

const apiKey = process.env.GROQ_API_KEY;

const MONGO_URI = "mongodb+srv://odeyaneeman_db_user:odeya12345@cluster0.hdainjd.mongodb.net/trip_planner_db?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(MONGO_URI)
    .then(() => console.log("מחובר בהצלחה לבסיס הנתונים MongoDB!"))
    .catch(err => console.error("שגיאה בחיבור ל-MongoDB:", err));

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const TripSchema = new mongoose.Schema({
    username: { type: String, required: true },
    region: { type: String, required: true },
    itinerary: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Trip = mongoose.model('Trip', TripSchema);
const User = mongoose.model('User', userSchema);

app.post('/api/register', async (req, res) => {
    const { firstName, lastName, email, username, password } = req.body;
    if (!firstName || !lastName || !email || !username || !password) {
        return res.status(400).json({ error: "נא למלא את כל השדות המבוקשים" });
    }
    try {
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ error: "שם המשתמש כבר תפוס, נסו שם אחר" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            firstName,
            lastName,
            email,
            username,
            password: hashedPassword
        });
        await newUser.save();
        res.status(201).json({ message: "ההרשמה בוצעה בהצלחה!" });
    } catch (error) {
        res.status(500).json({ error: "שגיאת שרת פנימית בתהליך הרישום" });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "נא למלא את כל השדות" });
    }
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: "שם משתמש או סיסמה שגויים" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "שם משתמש או סיסמה שגויים" });
        }
        res.json({ message: "התחברת בהצלחה!", username: user.username });
    } catch (error) {
        res.status(500).json({ error: "שגיאת שרת פנימית" });
    }
});

app.post('/api/generate-trip', async (req, res) => {
    const { prompt, username, region } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: "No prompt provided" });
    }

    try {
        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: `אתה מדריך טיולים מומחה בישראל. תבנה תוכנית טיול יומית קצרה וברורה.
חוקים נוקשים לתשובה:
1. שפה קלילה ונעימה בגובה העיניים. בלי סלנג ובלי אימוג'ים בכלל.
2. התמקד במסלולי הליכה, אטרקציות ונקודות טבע. אל תמליץ על מסעדות או אוכל.
3. תתחיל ישר מהלו"ז עצמו (למשל: 09:00 - ...). בלי הקדמות רובוטיות.
4. חוק התאמה קשיחה לפי בחירת האזור:
- אם האזור הוא מרכז או גוש דן: תחזיר מסלול המבוסס אך ורק על המיקומים: פארק הירקון, מוזיאון ארץ ישראל, טיילת תל אביב, שוק הכרמל. השורה האחרונה בתשובה חייבת להיות בדיוק: מיקומים למפה: פארק הירקון, מוזיאון ארץ ישראל, טיילת תל אביב, שוק הכרמל
- אם האזור הוא צפון: תחזיר מסלול המבוסס אך ורק על המיקומים: אגמון החולה, גן לאומי חורשת טל, שמורת טבע תל דן. השורה האחרונה בתשובה חייבת להיות בדיוק: מיקומים למפה: אגמון החולה, גן לאומי חורשת טל, שמורת טבע תל דן
- אם האזור הוא דרום: תחזיר מסלול המבוסס אך ורק על המיקומים: נחל בוקק, גן לאומי מצדה, שמורת עין גדי. השורה האחרונה בתשובה חייבת להיות בדיוק: מיקומים למפה: נחל בוקק, גן לאומי מצדה, שמורת עין גדי

5. חובה מוחלטת: בשורה האחרונה ממש של התשובה, רשום את כותרת המפה המדויקת והמיקומים מופרדים בפסיקים כפי שהוגדר לעיל.`
                    },
                    { role: "user", content: prompt }
                ],
                temperature: 0.1,
                stream: true
            })
        });

        if (!groqResponse.ok) {
            const errorDetails = await groqResponse.text();
            return res.status(groqResponse.status).json({ error: "Groq API error", details: errorDetails });
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const reader = groqResponse.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullText = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            res.write(chunk);
            fullText += chunk;
        }
        res.end();

        try {
            const lines = fullText.split('\n').filter(line => line.trim() !== '');
            let finalItinerary = "";
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    if (line.includes('[DONE]')) break;
                    try {
                        const parsed = JSON.parse(line.replace('data: ', ''));
                        const content = parsed.choices[0]?.delta?.content || "";
                        finalItinerary += content;
                    } catch (e) {}
                }
            }

            if (finalItinerary && username && region) {
                const newTrip = new Trip({ username, region, itinerary: finalItinerary });
                await newTrip.save();
            }
        } catch (dbError) {
            console.error("שגיאה בשמירת הטיול ל-MongoDB:", dbError);
        }

    } catch (error) {
        console.error("שגיאה כללית בתהליך הסטרימינג:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
});

app.get('/api/my-trips/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const trips = await Trip.find({ username: username }).sort({ createdAt: -1 });
        res.json(trips);
    } catch (error) {
        res.status(500).json({ error: "לא הצלחנו למשוך את היסטוריית הטיולים" });
    }
});

app.delete('/api/my-trips/:username', async (req, res) => {
    const { username } = req.params;
    try {
        await Trip.deleteMany({ username: username });
        res.status(200).json({ message: "היסטוריית הטיולים נמחקה בהצלחה" });
    } catch (error) {
        res.status(500).json({ error: "שגיאה פנימית בשרת" });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});