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

        // we set initial values
        this.hostile = true;
        this.STUN_DURATION = 3000;
        this.direction = new me.Vector2d(1, 0);

        //add weakpoint shape
        this.body.addShape(new me.Rect(-8, -3, 32, 3));

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
        if(!this.stunned) {
            this.stunned = true;
            setTimeout((function() { this.stunned = false; }).bind(this), this.STUN_DURATION);
        }
    },

    /**
     * update the entity
     */
    update : function (dt) {
        // apply physics to the body (this moves the entity)
        this.body.update(dt);

        //move to its direction
        if(this.stunned) {
            this.setCurrentAnimation('stun');
            this.body.vel = new me.Vector2d(0, 0);
        }
        else {
            if(!this.renderable.isCurrentAnimation('turnAround')){
                this.setCurrentAnimation('walking');
                this.body.vel.x += this.body.accel.x * me.timer.tick * this.direction.x;
            }
        }
        // handle collisions against other shapes
        me.collision.check(this);

        // return true if we moved or if the renderable was updated
        return (this._super(me.Entity, 'update', [dt]));
    },

   /**
     * colision handler
     * (called when colliding with other objects)
     */
    onCollision : function (response, other) {
        var myShapeIndex = response.a.name === this.name ? response.indexShapeA
                                                         : response.indexShapeB;

        // weakpoint hitbox collision shape must not be solid
        if (myShapeIndex > 0) {
            return false;
        }
        else {

            //if this is player, we pass through. else, turn around
            if(other.name == 'player') {
                return false;
            }
            else if(other.name == 'piglet') {
                return false
            }
            else {
                //if we hit a wall
                if(response.overlapN.x && !this.stunned) {
                    var relativeOverlapV = response.overlapV.clone().scale(this.name == response.a.name ? 1 : 0);
                    response.a.pos.sub(relativeOverlapV);
                    this.setCurrentAnimation('turnAround', (function () {
                        this.direction = this.direction.reflect(new me.Vector2d(0, 1));
                        this.setCurrentAnimation('walking');
                        this.renderable.flipX(this.direction.x < 0);
                    }).bind(this));

                    return true;
                }
            }

            return true;
        }
    }
});
