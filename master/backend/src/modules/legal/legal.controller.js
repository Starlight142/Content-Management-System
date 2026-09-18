const LegalArticle = require('../../database/models/LegalArticle');

// @route GET /api/legal
// @access Private
const getAllArticles = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category && category !== 'ALL' ? { category } : {};
    const articles = await LegalArticle.find(filter).sort({ effectiveDate: -1 });
    res.status(200).json(articles);
  } catch (error) {
    console.error('getAllArticles error:', error);
    res.status(500).json({ message: 'Server error retrieving legal articles' });
  }
};

// @route POST /api/legal
// @access Private (Admin)
const createArticle = async (req, res) => {
  try {
    const { title, category, description, content, source, effectiveDate } = req.body;

    const newArticle = await LegalArticle.create({
      title,
      category: category || 'Copyright',
      description,
      content,
      source,
      effectiveDate: effectiveDate || Date.now(),
    });

    res.status(201).json({ message: 'Legal article created', article: newArticle });
  } catch (error) {
    console.error('createArticle error:', error);
    res.status(500).json({ message: 'Server error creating legal article', error: error.message });
  }
};

// @route PATCH /api/legal/:id
// @access Private (Admin)
const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await LegalArticle.findByIdAndUpdate(id, req.body, { new: true });

    if (!updated) {
      return res.status(404).json({ message: 'Legal article not found' });
    }

    res.status(200).json({ message: 'Legal article updated', article: updated });
  } catch (error) {
    console.error('updateArticle error:', error);
    res.status(500).json({ message: 'Server error updating legal article' });
  }
};

// @route DELETE /api/legal/:id
// @access Private (Admin)
const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await LegalArticle.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Legal article not found' });
    }

    res.status(200).json({ message: 'Legal article deleted successfully' });
  } catch (error) {
    console.error('deleteArticle error:', error);
    res.status(500).json({ message: 'Server error deleting legal article' });
  }
};

module.exports = {
  getAllArticles,
  createArticle,
  updateArticle,
  deleteArticle,
};

