const admin = require('firebase-admin');

const db = admin.firestore();

 const sessionId=async (req, res) => {
  try {
  
    const { problemId } = req.body;
    
  
    const  userId  = req.real_user._id.toString();

    if (!userId || !problemId) {
      return res.status(400).json({ error: "User ID and Problem ID are required." });
    }

    const newSession = {
      problem_id: problemId,
      user1_id: userId,
      user2_id: null,
      current_driver: userId,
      code_content: `// Welcome to the Pair Programming Session!\n// The user designated as the 'Driver' can edit the code.\n// Click 'Sync Code' to share your changes with the 'Navigator'.\n// Use the 'Switch Roles' button to swap control.`,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(), 
    };

    const docRef = await db.collection('pair_sessions').add(newSession);

  
    res.status(201).json({ sessionId: docRef.id });

  } catch (error) {
    console.error("Error creating pair session:", error);
    res.status(500).json({ error: "Failed to create pair session." });
  }
};

const sessionDetail=async (req, res) => {
    try {
        const { sessionId } = req.params;
        const sessionRef = db.collection('pair_sessions').doc(sessionId);
        const docSnap = await sessionRef.get();

        if (!docSnap.exists) {
            return res.status(404).json({ error: 'Session not found.' });
        }

        // Return the essential info the frontend needs to join
        res.status(200).json({
            problemId: docSnap.data().problem_id
        });

    } catch (error) {
        console.error("Error fetching session details:", error);
        res.status(500).json({ error: 'Failed to fetch session details.' });
    }
}

module.exports = {sessionId,sessionDetail};