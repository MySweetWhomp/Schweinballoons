/**
 * Boar Entity
 */
game.BoarEntity = me.Entity.extend({

    /**
     * constructor
     */
    init:function (x, y, settings) {
        // call the constructor
        this._super(me.Entity, 'init', [x, y , settings]);
        this.name = 'boar';

        // we set the velocity of the boar's body
        this.body.setVelocity(1, 9);
        // shift sprite so that collision box is its bottom
        this.renderable.translate(0, -2);

        // we always update the piglets, ALWAYS
        this.alwaysUpdate = true;
        this.dying = false;

        // we set initial values
        this.hostile = true;
        this.STUN_DURATION = 1000;
        this.DEATH_STAND_DURATION = 500;
        this.DEATH_MAX_HEIGHT = 40;
        this.TIME_TO_DEATH_MAX_HEIGHT = 400;
        this.direction = new me.Vector2d(1, 0);

        // add weakpoint shape
        this.body.addShape(new me.Rect(-8, -3, 32, 3));
        this.body.addShape(new me.Rect(0, 0, 15, 32));

        // animations
        this.renderable.addAnimation('idle', [0, 1, 2], 150);
        this.renderable.addAnimation('jumpedOver', [3, 4, 4, 5], 50);
        this.renderable.addAnimation('stun', [3, 4, 4, 5], 50);
        this.renderable.addAnimation('walking', [6, 7, 8], 100);
        this.renderable.addAnimation('turnAround', [9, 9], 50);
        this.renderable.addAnimation('death', [10, 11], 50);
        this.setCurrentAnimation('walking');
    },

    setCurrentAnimation: function(name, onComplete) {
        if (!this.renderable.isCurrentAnimation(name)) {
            this.renderable.setCurrentAnimation(name, onComplete);
        }
    },

    stun: function() {
        if (!this.stunned) {
            this.stunned = true;
            me.timer.setTimeout((function() { this.stunned = false; }).bind(this), this.STUN_DURATION);
        }
    },

    /**
     * update the entity
     */
    update : function (dt) {
        // apply physics to the body (this moves the entity)
        this.body.update(dt);

        if (me.input.isKeyPressed('debug'))
            this.kill();

        // if the entity is dying
        if (this.dying) {
            // set animation
            this.setCurrentAnimation('death');

            // if done standing
            if (this.deathTimer >= this.DEATH_STAND_DURATION) {
                // adding offset to describe a parabola, using the formula :
                // f(t + dt) = f'(t)dt + f(t)
                // here with f(t) = -h/t_h² * (t-t_h)² + h
                // using this formula removes the need for an useless variable
                var a = this.DEATH_MAX_HEIGHT / Math.pow(this.TIME_TO_DEATH_MAX_HEIGHT, 2);
                var t = this.deathTimer - this.DEATH_STAND_DURATION - this.TIME_TO_DEATH_MAX_HEIGHT;
                this.body.pos.y += 2*a*t*dt;
            }

            // if out of viewport, we destroy the entity
            if (!me.game.viewport.contains(this)) {
                me.game.world.removeChild(this);
            }

            // counting time
            this.deathTimer += dt;

        } else {
            // stops if stunned, else walk
            if (this.stunned) {
                this.setCurrentAnimation('stun');
                this.body.vel = new me.Vector2d(0, 0);
            } else {
                if (!this.renderable.isCurrentAnimation('turnAround')){
                    this.setCurrentAnimation('walking');
                    this.body.vel.x += this.body.accel.x * me.timer.tick * this.direction.x;
                }
            }
        }

        // handle collisions against other shapes
        me.collision.check(this);

        // return true if we moved or if the renderable was updated
        return (this._super(me.Entity, 'update', [dt]));
    },

    /**
      * kill
      * (this will destroy the entity : be careful)
      */
    kill: function() {
        // stopping body
        this.dying = true;
        this.body.gravity = 0;
        this.body.vel = new me.Vector2d(0, 0);
        this.deathTimer = 0;//stamp = me.timer.getTime();

        // remove all shapes
        while(this.body.removeShapeAt(this.body.shapes.length - 1) != 0);
    },

   /**
     * colision handler
     * (called when colliding with other objects)
     */
    onCollision : function (response, other) {
        // if currently dying
        if (this.dying) {
            //nothing is solid
            return false;
        }

        // get shape index for this entity
        var myShapeIndex = response.a.name === this.name ? response.indexShapeA
                                                         : response.indexShapeB;

        // weakpoint hitbox collision shape must not be solid
        if (myShapeIndex > 0) {
            return false;
        }  else {
            // if this is player, we pass through. else, turn around
            if (other.name === 'player') {
                return false;
            } else if (other.name === 'piglet') {
                return false
            } else if (other.name === 'ball') {
                // TODO : ball hits monster
                return false;
            } else {
                // if we hit a wall
                if (response.overlapN.x && !this.stunned) {
                    // we compute independant overlap and remove the object from the wall
                    var relativeOverlapV = response.overlapV.clone().scale(this.name === response.a.name ? 1 : 0);
                    response.a.pos.sub(relativeOverlapV);

                    //we change the animation
                    this.setCurrentAnimation('turnAround', (function () {
                        this.direction = this.direction.reflect(new me.Vector2d(0, 1));
                        this.setCurrentAnimation('walking');
                        this.renderable.flipX(this.direction.x < 0);
                    }).bind(this));

                    //this is solid
                    return true;
                }
            }
            //make all objects solid
            return true;
        }
    }
});
