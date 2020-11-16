let queueAlert = [];

function addToQueue(simpleAlert) {
    queueAlert.push(simpleAlert);
    if (queueAlert.length === 1) {
        showAlert(simpleAlert);
    } else {
    }
}

function nextAlert() {
    let i = queueAlert.shift();
    if (queueAlert.length > 0) {
        showAlert(queueAlert[0]);
    }
}

function showAlert(simpleAlert) {
    document.getElementsByTagName("body")[0].appendChild(simpleAlert.view);
    simpleAlert.view.style.visibility = "visible";
}

function SimpleAlert(title, message) {
    this.title = title;
    this.message = message;
    this.leftBtn;
    this.rightBtn;
    this.view;

    this.addLeftButton = function (button) {
        this.leftBtn = button;
        return this;
    },
        this.addRightButton = function (button) {
            this.rightBtn = button;
            return this;
        },
        this.createView = function () {
            this.view = view = document.createElement("div");
            view.id = "simple-popup";

            view.overlay = overlay = document.createElement("div");
            overlay.id = "s-overlay";
            view.appendChild(overlay);

            view.popup = popup = document.createElement("div");
            popup.id = "s-popup";
            view.appendChild(popup);

            view.popup.popupTitle = popupTitle = document.createElement("h3");
            popupTitle.id = "s-popup-title";
            popupTitle.innerText = "";
            popup.appendChild(popupTitle);

            view.popup.popupText = popupText = document.createElement("p");
            popupText.id = "popup-title";
            popupText.innerText = "text text text";
            popup.appendChild(popupText);

            view.popup.popupButtons = popupButtons = document.createElement("div");
            popupButtons.id = "popup-buttons";
            popupButtons.className = "s-button-holder s-two-button";
            popup.appendChild(popupButtons);

            if (this.leftBtn && this.rightBtn) {
                view.popup.popupButtons.leftButton = leftButton = document.createElement("div");
                leftButton.id = "left-btn";
                leftButton.className = "simplebuttonLeft";
                leftButton.innerText = "Button1";
                popupButtons.appendChild(leftButton);

                view.popup.popupButtons.rightButton = rightButton = document.createElement("div");
                rightButton.id = "right-btn";
                rightButton.className = "simplebuttonRight";
                rightButton.innerText = "Button2";
                popupButtons.appendChild(rightButton);
            } else {
                view.popup.popupButtons.leftButton = leftButton = document.createElement("div");
                leftButton.id = "left-btn";
                leftButton.className = "simplebutton-long";
                leftButton.innerText = "Button1";
                popupButtons.appendChild(leftButton);
            }
        },
        this.dismiss = function () {
            this.view.remove();
        };

    this.showAlert = function () {
        this.createView();
        let self = this;
        let leftBtnView = view.popup.popupButtons.leftButton;
        let rightBtnView = view.popup.popupButtons.rightButton;
        view.popup.popupTitle.innerText = this.title;
        view.popup.popupText.innerText = this.message;
        if (this.leftBtn) {
            leftBtnView.innerHTML = this.leftBtn.text;
            leftBtnView.addEventListener("touchstart", function (ev) {
                leftBtnView.classList.add("active-actions");
                try {
                    self.leftBtn.handler();
                } catch (error) {
                    console.log(error);
                }
                self.dismiss();
                nextAlert();
            }, false);
        }
        if (this.rightBtn) {
            rightBtnView.innerHTML = this.rightBtn.text;
            rightBtnView.addEventListener("touchstart", function (ev) {
                rightBtnView.classList.add("active-actions");
                try {
                    self.rightBtn.handler();
                } catch (error) {
                    console.log(error);
                }
                self.dismiss();
                nextAlert();
            }, false);
        }
        addToQueue(this);
    };
}

function SimpleButtonHandler(text, handler) {
    this.text = text;
    this.handler = handler;
}