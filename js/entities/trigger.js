/**
 * Trigger Entity
 */
game.TriggerEntity = me.Entity.extend({

    /**
     * constructor
     */
    init:function (x, y, settings) {
        // set settings
        settings.image = 'switch';
        settings.frameheight = 16;
        settings.framewidth = 16;

        // call the constructor
        this._super(me.Entity, 'init', [x, y , settings]);
        this.name = 'trigger';

        // flip the sprite so it matches orientation
        if (settings.facing === 'down') {
            this.renderable.angle = Math.PI; // consider using flipY instead ?
        } else if (settings.facing === 'left') {
            this.renderable.angle = -Math.PI / 2;
        } else if (settings.facing === 'right') {
            this.renderable.angle = Math.PI / 2;
        } else {
            this.renderable.angle = 0;
        }


        // set the channel
        this.channel = settings.channel;

        this.closingTimeout = null;
        this.beforeClose = settings.beforeClose || 3000;

        // we set the velocity of the player's body
        this.body.setVelocity(0, 0);
        this.body.setMaxVelocity(0, 0);
        this.body.gravity = 0;

        this.alwaysUpdate = true;

        //animations
        this.renderable.addAnimation('on', [1, 1], 50);
        this.renderable.addAnimation('off', [0, 0], 50);
    },

    setCurrentAnimation: function(name, onComplete) {
        if (!this.renderable.isCurrentAnimation(name)) {
            this.renderable.setCurrentAnimation(name, onComplete);
        }
    },

    break: function() {
        //break the block
        me.game.world.removeChild(this);
    },

    /**
     * update the entity
     */
    update : function (dt) {
        // apply physics to the body (this moves the entity)
        this.body.update(dt);

        // handle collisions against other shapes
        me.collision.check(this);

        // set animation
        this.setCurrentAnimation(game.channels[this.channel] ? 'on' : 'off');

        // return true if we moved or if the renderable was updated
        return (this._super(me.Entity, 'update', [dt]));
    },

    activateChannel: function(channel) {
        if (!game.channels[channel]) {
            me.audio.playUnique('interrupteur', 'action');

            game.channels[channel] = true;

            // set timeout to close the doors
            if (this.closingTimeout == null) {
                this.closingTimeout = me.timer.setTimeout((function() {
                    this.deactivateChannel(this.channel);
                    this.closingTimeout = null;
                }).bind(this), this.beforeClose);
            }
        }
    },

    deactivateChannel: function(channel) {
        if (game.channels[channel]) {
            me.audio.playUnique('interrupteur', 'action');

            game.channels[channel] = false;
        }
    },

   /**
     * colision handler
     * (called when colliding with other objects)
     */
    onCollision: function (response, other) {
        return false;
    },

    trigger: function() {
        this.activateChannel(this.channel);
    }
});
