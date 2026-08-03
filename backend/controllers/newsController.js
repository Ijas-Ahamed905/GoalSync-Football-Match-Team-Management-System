import News from '../models/News.js';

// @desc    Get all news posts
// @route   GET /api/news
// @access  Private
export const getNews = async (req, res) => {
  try {
    const news = await News.find({}).populate('author', 'name role').sort({ createdAt: -1 });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create news post
// @route   POST /api/news
// @access  Private (Coach/Admin)
export const createNews = async (req, res) => {
  const { title, content } = req.body;

  try {
    const post = new News({
      title,
      content,
      author: req.user._id,
    });

    const createdPost = await post.save();
    
    const populated = await News.findById(createdPost._id).populate('author', 'name role');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update news post
// @route   PUT /api/news/:id
// @access  Private (Coach/Admin)
export const updateNews = async (req, res) => {
  const { title, content } = req.body;

  try {
    const post = await News.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'News post not found' });
    }

    post.title = title || post.title;
    post.content = content || post.content;

    const updatedPost = await post.save();
    const populated = await News.findById(updatedPost._id).populate('author', 'name role');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete news post
// @route   DELETE /api/news/:id
// @access  Private (Coach/Admin)
export const deleteNews = async (req, res) => {
  try {
    const post = await News.findById(req.params.id);

    if (post) {
      await News.deleteOne({ _id: post._id });
      res.json({ message: 'News post removed' });
    } else {
      res.status(404).json({ message: 'News post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
