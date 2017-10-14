'use strict';

/**
 * Module dependencies.
 */
const should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Article = mongoose.model('Article');

/**
 * Globals
 */
let user, article;

/**
 * Unit tests
 */
describe('Article Model Unit Tests:', () => {

  beforeEach((done) => {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    });

    user.save(() => {
      article = new Article({
        title: 'Article Title',
        content: 'Article Content',
        user: user
      });

      done();
    });
  });

  describe('Method Save', () => {
    it('should be able to save without problems', function (done) {
      this.timeout(10000);
      return article.save((err) => {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without title', (done) => {
      article.title = '';

      return article.save((err) => {
        should.exist(err);
        done();
      });
    });
  });

  afterEach((done) => {
    Article.remove().exec(() => {
      User.remove().exec(done);
    });
  });
});
