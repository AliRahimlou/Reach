import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Spinner from '../../pages/loadingGif/Loader';
import PostItem from '../posts/PostItem';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import { getPost } from '../../actions/Post';

const Post = ({ getPost, post: { post, loading }, match }) => {
  useEffect(() => {
    getPost(match.params.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getPost]);

  return loading || post === null ? (
    <Spinner />
  ) : (
    <Fragment>
      <div className='lightWool py-5'>
        <div className='container'>
          <div className='card p-5'>
            <Link to='/posts' className='btn'>
              Back To Posts
            </Link>
            <PostItem post={post} showActions={false} />
            <CommentForm postId={post._id} />
            <div className='comments'>
              {post.comments.map(comment => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  postId={post._id}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

Post.propTypes = {
  getPost: PropTypes.func.isRequired,
  post: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  post: state.post
});

export default connect(mapStateToProps, { getPost })(Post);
