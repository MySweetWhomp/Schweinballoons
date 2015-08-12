/**
 * Ball Entity
 */
game.BallEntity = me.Entity.extend({
    /**
     * constructor
     */
    init: function (x, y, settings) {
        // call the constructor
        this._super(me.Entity, 'init', [x, y , settings]);
        this.name = 'ball';

        // the ball must not react to gravity
        this.body.setVelocity(3, 3);
        this.body.gravity = 0;

        // we always update the ball, ALWAYS
        this.alwaysUpdate = true;

        // set ball direction
        this.direction = new me.Vector2d(0, 1);
        this.lastDirectionChange = 50;
        this.BEFORE_DIRECTION_CHANGE_TIME = 50;
    },

    /**
     * update the entity
     */
    update: function(dt) {
        if (this.direction.x !== 0 && this.direction.y !== 0) {
            this.direction.y = 0;
        }

        this.body.vel.set(0, 0);
        this.body.vel.x += (this.body.accel.x * me.timer.tick) * this.direction.x;
        this.body.vel.y += (this.body.accel.y * me.timer.tick) * this.direction.y;

        // apply physics to the body (this moves the entity)
        this.body.update(dt);

        // handle collisions against other shapes
        me.collision.check(this);

        // make sure we're in the viewport (or bounce direction)
        if (!me.game.viewport.contains(this)) {
            if (this.top < me.game.viewport.top) {
                this.goDown();
            } else if (this.right > me.game.viewport.right) {
                this.goLeft();
            } else if (this.bottom > me.game.viewport.bottom) {
                this.goUp();
            } else if (this.left < me.game.viewport.left) {
                this.goRight();
            }
        }

        this.lastDirectionChange += dt;

        return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },

    go: function(x, y) {
        if (this.lastDirectionChange > this.BEFORE_DIRECTION_CHANGE_TIME) {
            this.direction.x = x;
            this.direction.y = y;
            this.lastDirectionChange = 0;
        }
    },

    bounceDirection: function() {
        this.go(-this.direction.x, -this.direction.y);
    },

    goUp: function() {
        this.go(0, -1);
    },

    goRight: function() {
        this.go(1, 0);
    },

    goDown: function() {
        this.go(0, 1);
    },

    goLeft: function() {
        this.go(-1, 0);
    },

    onCollision: function(response, other) {
        if (other.name !== 'player') {
            this.bounceDirection();
        } else {
            if ((Math.abs(response.overlapV.x) > Math.abs(response.overlapV.y)) &&
                (other.body.vel.x !== 0 || other.onAirTime === 0)) {
                if (response.overlapV.x < 0) {
                    this.goLeft();
                } else {
                    this.goRight();
                }
            } else {
                if (response.overlapV.y > 0) {
                    this.goDown();
                } else {
                    this.goUp();
                }
            }
        }
        return false;
    }
});
