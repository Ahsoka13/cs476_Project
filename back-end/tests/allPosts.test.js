const request = require('supertest');
const app = require('../app'); 
const mongoose = require('mongoose');
const Post = require('../models/post');
const User = require('../models/user');
const { expect } = require('chai');

var user = null;

before(async () => {
  user = new User({ first_name: 'Test', last_name:'User', email: 'testuser@example.com',  password: 'Snow1234#'});
  await user.save();

  const posts = [
    new Post({ user: user._id, amount_willing_to_pay: 1, amount_willing_to_pay_currency: 'USD', desired_amount_in_return: 80, desired_amount_in_return_currency: 'INR', additional_details: '', updatedAt: new Date() }),
    new Post({ user: user._id, amount_willing_to_pay: 2, amount_willing_to_pay_currency: 'USD', desired_amount_in_return: 160, desired_amount_in_return_currency: 'INR', additional_details: '', updatedAt: new Date(Date.now() + 5000) }),
  ];
  await Post.insertMany(posts);
});

after(async () => {
  await Post.deleteMany({ user: user._id });
  await User.deleteOne({ _id: user._id });
  await mongoose.connection.close();
});

describe('GET allPosts', () => {
  it('should return all posts with user populated, sorted by updatedAt descending', async () => {
    const response = await request(app).get('/api/allPosts');

    expect(response.status).to.equal(200); 
    expect(response.body).to.be.an('array');
    expect(response.body.length).to.be.at.least(1); 

    expect(new Date(response.body[0].updatedAt)).to.be.at.least(new Date(response.body[1].updatedAt));

    expect(response.body[0].user).to.have.property('first_name', 'Test');
    expect(response.body[0].user).to.have.property('email', 'testuser@example.com');
  });
});
