const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const verifyToken = require('../verifyToken')
const axios = require('axios');
// import { pipeline, env } from '@xenova/transformers';

// const pipe = await pipeline('espnet/kan-bayashi_ljspeech_vits')

// Create
router.post("/create", verifyToken, async (req, res) => {
  try {
    const newPost = new Post(req.body);
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Edit
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ postId: req.params.id });
    res.status(200).json("Post has been deleted!");
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get Single Post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get All Posts
router.get("/", async (req, res) => {
  const query = req.query;
  try {
    const searchFilter = {
      title: { $regex: query.search, $options: "i" },
    };
    const posts = await Post.find(query.search ? searchFilter : null);
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get All Posts
router.post('/synthesize', async (req, res) => {
  const { text } = req.body;
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/mms-tts-eng',
      JSON.stringify({ inputs: text }),
      {
          headers: {
              'Authorization': `Bearer ${process.env.HUGGINFACE_TOKEN}`,
              'Content-Type': 'application/json',
              'responseType': 'arraybuffer'
          },
          responseType: 'arraybuffer'
      }
  );

  res.writeHead(200, {
      'Content-Type': 'audio/wav',
      'Content-Length': response.data.length
  });
  res.end(Buffer.from(response.data));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get User Posts
router.get("/user/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});



module.exports = router;
