window.onload = function () {
    var hichat = new HiChat();
    hichat.init();
};

var HiChat = function () {
    this.socket = null;
};

HiChat.prototype = {
    init: function () {
        var that = this;
        this.socket = io.connect();
        this.socket.on('connect', function () {
            document.getElementById('info').textContent = '请输入昵称:';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();
        });
        document.getElementById('loginBtn').addEventListener('click', function () {
            var nickName = document.getElementById('nicknameInput').value;
            if (nickName.trim().length !== 0) {
                that.socket.emit('login', nickName);
            } else {
                document.getElementById('nicknameInput').focus();
            }
        }, false);
        this.socket.on('nickExisted', function () {
            document.getElementById('info').textContent = '昵称已存在！'
        });
        this.socket.on('loginSuccess', function () {
            document.title = '聊撩 | ' + document.getElementById('nicknameInput').value;
            document.getElementById('loginWrapper').style.display = 'none';
            document.getElementById('messageInput').focus();
        });
        this.socket.on('system', function (nickName, userCount, type) {
            var msg = nickName + (type === 'login' ? '加入' : '离开');
            that._displayNewMsg('系统', msg, 'red');
            // var p = document.createElement('p');
            // p.textContent = msg;
            // document.getElementById('historyMsg').appendChild(p);
            document.getElementById('status').textContent = userCount + ' 人在线';
        });
        document.getElementById('sendBtn').addEventListener('click', function () {
            var messageInput = document.getElementById('messageInput'),
                msg = messageInput.value,
                color = document.getElementById('colorStyle').value;
            messageInput.value = '';
            messageInput.focus();
            if (msg.trim().length !== 0) {
                that.socket.emit('postMsg', msg, color);
                that._displayNewMsg('我', msg, color);
            }
        }, false);
        this.socket.on('newMsg', function (user, msg, color) {
            that._displayNewMsg(user, msg, color);
        });
        document.getElementById('sendImage').addEventListener('change', function () {
            var color = document.getElementById('colorStyle').value;
            if (this.files.length !== 0) {
                var file = this.files[0],
                    reader = new FileReader();
                if (!reader) {
                    that._displayNewMsg('系统', '您的系统不支持发送图片', 'red');
                    this.value = '';
                    return;
                }
                reader.onload = function (e) {
                    this.value = '';
                    that.socket.emit('img', e.target.result, color);
                    that._displayImage('我', e.target.result, color);
                };
                reader.readAsDataURL(file);
            }
        }, false);
        this.socket.on('newImage', function (user, img, color) {
            that._displayImage(user, img, color);
        });
        this._initialEmoji();
        document.getElementById('emoji').addEventListener('click', function (e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            emojiwrapper.style.display = 'block';
            e.stopPropagation();
        }, false);
        document.body.addEventListener('click', function (e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            if (e.target !== emojiwrapper) {
                emojiwrapper.style.display = 'none';
            }
        });
        document.getElementById('emojiWrapper').addEventListener('click', function (e) {
            var target = e.target;
            if (target.nodeName.toLowerCase() === 'img') {
                var messageInput = document.getElementById('messageInput');
                messageInput.focus();
                messageInput.value = messageInput.value + '[emoji:' + target.title + ']';
            }
        }, false);
        document.getElementById('nicknameInput').addEventListener('keyup', function (e) {
            if (e.keyCode === 13) {
                var nickName = document.getElementById('nicknameInput').value;
                if (nickName.trim().length !== 0) {
                    that.socket.emit('login', nickName);
                }
            }
        }, false);
        document.getElementById('messageInput').addEventListener('keyup', function (e) {
            var messageInput = document.getElementById('messageInput'),
                msg = messageInput.value,
                color = document.getElementById('colorStyle').value;
            if (e.keyCode === 13 && msg.trim().length !== 0) {
                messageInput.value = '';
                that.socket.emit('postMsg', msg, color);
                that._displayNewMsg('我', msg, color);
            }
        }, false);
    },
    _displayNewMsg: function (user, msg, color) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8);
        msg = this._showEmoji(msg);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '):</span>' + msg;
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },
    _displayImage: function (user, imgData, color) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },
    _initialEmoji: function () {
        var emojiContainer = document.getElementById('emojiWrapper'),
            docFragment = document.createDocumentFragment();
        for (var i = 69; i > 0; i--) {
            var emojiItem = document.createElement('img');
            emojiItem.src = '../content/emoji/' + i + '.gif';
            emojiItem.title = i;
            docFragment.appendChild(emojiItem);
        }
        emojiContainer.appendChild(docFragment);
    },
    _showEmoji: function (msg) {
        var match, result = msg,
            reg = /\[emoji:\d+\]/g,
            emojiIndex,
            totalEmojiNum = document.getElementById('emojiWrapper').children.length;
        while (match = reg.exec(msg)) {
            emojiIndex = match[0].slice(7, -1);
            if (emojiIndex > totalEmojiNum) {
                result = result.replace(match[0], '[X]');
            } else {
                result = result.replace(match[0], '<img class="emogi" src="../content/emoji/' + emojiIndex + '.gif">');
            }
        }
        return result;
    }
};
