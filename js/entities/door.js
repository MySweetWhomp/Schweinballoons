/**
 * Door Entity
 */
game.DoorEntity = me.Entity.extend({

    /**
     * constructor
     */
    init:function (x, y, settings) {
        // set settings
        settings.image = 'door';
        settings.frameheight = 16;
        settings.framewidth = 48;

        // call the constructor
        this._super(me.Entity, 'init', [x, y , settings]);
        this.name = 'door';
        this.closed = true;
        this.channel = settings.channel;
        this.anchor = this.pos.clone();

        // set channel
        game.channels[this.channel] = false;

        // flip the sprite so it matches orientation
        this.facing = settings.facing;
        if (this.facing === 'right') {
            this.renderable.angle = Math.PI; // consider using flipY instead ?
        } else if (this.facing === 'up') {
            this.renderable.angle = Math.PI / 2;
        } else if (this.facing === 'down') {
            this.renderable.angle = -Math.PI / 2;
        } else {
            this.renderable.angle = 0;
        }

        // set the channel
        this.channel = settings.channel;

        // we set the velocity of the player's body
        this.body.setVelocity(1, 1);
        this.body.gravity = 0;
    },

    /**
     * update the entity
     */
    update : function (dt) {
        // apply physics to the body (this moves the entity)
        this.body.update(dt);

        // handle collisions against other shapes
        me.collision.check(this);

        // handle opening
        var isChannelOn = game.channels[this.channel];
        if (isChannelOn) {
            if (!this.isFullyOpened()) {
                this.open();
            } else {
                this.body.vel.set(0, 0);
            }
        } else {
            if (!this.isFullyClosed()) {
                this.close();
                //this.body.vel.y += this.body.accel.y * me.timer.tick;
            } else {
                this.pos.set(this.anchor.x, this.anchor.y);
                this.body.vel.y = 0;
            }
        }

        // return true if we moved or if the renderable was updated
        return (this._super(me.Entity, 'update', [dt]));
    },

    isFullyOpened: function() {
        if (this.facing === 'up') {
            return this.pos.y <= this.anchor.y - 48;
        } else if (this.facing === 'right') {
            return this.pos.x >= this.anchor.x + 48;
        } else if (this.facing === 'down') {
            return this.pos.y >= this.anchor.y + 48;
        } else if (this.facing === 'left') {
            return this.pos.x <= this.anchor.x - 48;
        }
    },

    isFullyClosed: function() {
        if (this.facing === 'up') {
            return this.pos.y >= this.anchor.y;
        } else if (this.facing === 'right') {
            return this.pos.x <= this.anchor.x;
        } else if (this.facing === 'down') {
            return this.pos.y <= this.anchor.y;
        } else if (this.facing === 'left') {
            return this.pos.x >= this.anchor.x;
        }
    },

    open: function() {
        if (this.facing === 'up') {
            this.body.vel.y -= this.body.accel.y * me.timer.tick;
        } else if (this.facing === 'right') {
            this.body.vel.x += this.body.accel.x * me.timer.tick;
        } else if (this.facing === 'down') {
            this.body.vel.y += this.body.accel.y * me.timer.tick;
        } else if (this.facing === 'left') {
            this.body.vel.x -= this.body.accel.x * me.timer.tick;
        }
    },

    close: function() {
        if (this.facing === 'up') {
            this.body.vel.y += this.body.accel.y * me.timer.tick;
        } else if (this.facing === 'right') {
            this.body.vel.x -= this.body.accel.x * me.timer.tick;
        } else if (this.facing === 'down') {
            this.body.vel.y -= this.body.accel.y * me.timer.tick;
        } else if (this.facing === 'left') {
            this.body.vel.x += this.body.accel.x * me.timer.tick;
        }
    },

   /**
     * colision handler
     * (called when colliding with other objects)
     */
    onCollision: function (response, other) {
        return false;
    }
});
