

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//  Enable CORS for all origins
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Parse JSON bodies
app.use(express.json());

app.use((req, res, next) => {
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
        return res.sendStatus(200);
    }
    next();
});

// MongoDB Connection
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vormdea.mongodb.net/flixoDB?retryWrites=true&w=majority`;
const uri = process.env.MONGODB_URL;


        // Remove cart from DB 

        app.delete("/cart/item", async (req, res) => {
            const { userId, productId } = req.body; 

            if (!userId || !productId) {
                return res.status(400).json({ error: "Missing userId or productId" });
            }

            try {
                const result = await cartsCollection.updateOne(
                    { userId },
                    {
                        $pull: { items: { productId } },
                        $set: { updatedAt: new Date() }
                    }
                );

                if (result.modifiedCount === 0) {
                    return res.status(404).json({ error: "Cart or item not found" });
                }

                res.json({ success: true });
            } catch (err) {
                console.error("Remove from cart error:", err);
                res.status(500).json({ error: "Failed to remove item" });
            }
        });

        app.delete("/cart/clear", async (req, res) => {
            const { userId } = req.body;
            if (!userId) return res.status(400).json({ error: "userId required" });

            try {
                await cartsCollection.updateOne(
                    { userId },
                    { $set: { items: [], updatedAt: new Date() } }
                );
                res.json({ success: true });
            } catch (err) {
                res.status(500).json({ error: "Failed to clear cart" });
            }
        });

        //  Quantity decrise
        app.patch("/cart/decrease", async (req, res) => {
            const { userId, productId } = req.body;

            try {
                const cart = await cartsCollection.findOne({ userId });
                const item = cart.items.find(i => i.productId === productId);

                if (item && item.quantity > 1) {
                    await cartsCollection.updateOne(
                        { userId, "items.productId": productId },
                        { $inc: { "items.$.quantity": -1 }, $set: { updatedAt: new Date() } }
                    );
                } else {

                    await cartsCollection.updateOne(
                        { userId },
                        { $pull: { items: { productId } } }
                    );
                }
                res.json({ success: true });
            } catch (err) {
                res.status(500).json({ error: "Failed" });
            }
        });






        console.log("MongoDB Connected!");
    } finally { }
}

run().catch(console.dir);

app.listen(port, () => console.log(`Server running on port ${port}`));
