const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');
const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req,res) => {res.sendStatus(200)})
    .get(cors.cors,authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({
            user: req.user._id
        })
            .populate('user')
            .populate('dishes')
            .then((Favorite) => {
                if (Favorite !== null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(Favorite);
                } else {
                    err = new Error('Favorite by' + req.user._id + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({
            user: req.user._id
        })
            .then((Favorite) => {
                if (Favorite !== null) {
                    for (var i = 0; i < req.body.length; i++) {
                        if (Favorite.dishes.indexOf(req.body[i]) === -1) {
                            Favorite.dishes.push(req.body[i]);
                        }
                    }
                    Favorite.save()
                        .then((Favorite) => {
                            Favorites.findById(Favorite._id)
                                .populate('user')
                                .populate('dishes')
                                .then((Favorite) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(Favorite);
                                })
                        })
                        .catch((err) => {
                            return next(err);
                        });
                }
                if (Favorite === null) {
                    Favorites.create({
                        user: req.user._id
                    })
                        .then((Favorite) => {
                            for (var i = 0; i < req.body.length; i++) {
                                Favorite.dishes.push(req.body[i]);
                            }
                            Favorite.save()
                                .then((Favorite) => {
                                    Favorites.findById(Favorite._id)
                                        .populate('user')
                                        .populate('dishes')
                                        .then((Favorite) => {
                                            res.statusCode = 200;
                                            res.setHeader('Content-Type', 'application/json');
                                            res.json(Favorite);
                                        })
                                }, (err) => next(err));
                        });
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Favorites.findOneAndRemove({
            user: req.user._id
        })
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });


favoriteRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req,res)=>{res.sendStatus(200)})
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .then((favorites) => {
                if (!favorites) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({ "exists": false, "favorites": favorites });
                }
                else {
                    if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({ "exists": false, "favorites": favorites });
                    }
                    else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({ "exists": true, "favorites": favorites });
                    }
                }

            }, (err) => next(err))
            .catch((err) => next(err))
    })
    .post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({
            user: req.user._id
        })
            .then((Favorite) => {
                if (Favorite !== null) {
                    if (Favorite.dishes.indexOf(req.params.dishId) === -1) {
                        Favorite.dishes.push(req.params.dishId)
                        Favorite.save()
                            .then((Favorite) => {
                                Favorites.findById(Favorite._id)
                                    .populate('user')
                                    .populate('dishes')
                                    .then((Favorite) => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(Favorite);
                                    })
                            }, (err) => next(err));
                    }
                }
                if (Favorite === null) {
                    Favorites.create({
                        user: req.user._id
                    })
                        .then((Favorite) => {
                            Favorite.dishes.push(req.params.dishId)
                            Favorite.save()
                                .then((Favorite) => {
                                    Favorites.findById(Favorite._id)
                                        .populate('user')
                                        .populate('dishes')
                                        .then((Favorite) => {
                                            res.statusCode = 200;
                                            res.setHeader('Content-Type', 'application/json');
                                            res.json(Favorite);
                                        })
                                }, (err) => next(err));
                        });
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({
            user: req.user._id
        })
            .then((Favorite) => {
                if (Favorite !== null) {
                    for (var i = 0; i < Favorite.dishes.length; i++) {
                        if (Favorite.dishes[i] === req.params.dishId) {
                            Favorite.dishes.remove(req.params.dishId);
                            Favorite.save()
                                .then((Favorite) => {
                                    Favorites.findById(Favorite._id)
                                        .populate('user')
                                        .populate('dishes')
                                        .then((Favorite) => {
                                            res.statusCode = 200;
                                            res.setHeader('Content-Type', 'application/json');
                                            res.json(Favorite);
                                        })
                                }, (err) => next(err));
                            break;
                        }
                    }
                }
                if (Favorite === null) {
                    err = new Error('Favorite by' + req.user._id + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });

module.exports = favoriteRouter;