const Review = require("../models/Review");

const getInitials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

const buildStarArray = (rating) => ({
  filled: Array.from({ length: rating }, (_, index) => index),
  empty: Array.from({ length: 5 - rating }, (_, index) => index),
});

const mapReview = (review) => ({
  ...review,
  initials: getInitials(review.name || "Student"),
  stars: buildStarArray(review.rating || 0),
  formattedDate: new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(review.createdAt)),
});

const renderHostelPage = async (req, res, next) => {
  try {
    const [reviewCount, reviewAverage, recentReviews] = await Promise.all([
      Review.countDocuments({ status: "published" }),
      Review.aggregate([
        { $match: { status: "published" } },
        { $group: { _id: null, average: { $avg: "$rating" } } },
      ]),
      Review.find({ status: "published" })
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

    res.render("Hostel/hostel", {
      authUser: req.authUser || null,
      reviewStats: {
        count: reviewCount,
        average: reviewAverage[0]?.average || 0,
      },
      recentReviews: recentReviews.map(mapReview),
    });
  } catch (error) {
    return next(error);
  }
};

const createReview = async (req, res) => {
  try {
    const course = (req.body.course || "").trim();
    const message = (req.body.message || "").trim();
    const rating = Number.parseInt(req.body.rating, 10);

    if (
      !course ||
      !message ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return res.redirect("/api/v1/b2#reviews");
    }

    await Review.create({
      userId: req.authUser._id,
      name: req.authUser.name,
      course,
      rating,
      message,
      status: "published",
    });

    return res.redirect("/api/v1/b2#reviews");
  } catch (error) {
    return res.redirect("/api/v1/b2#reviews");
  }
};

module.exports = {
  renderHostelPage,
  createReview,
};
