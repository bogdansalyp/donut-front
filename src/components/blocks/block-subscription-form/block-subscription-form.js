import React, { Component } from 'react';
import { inject } from 'mobx-react';

import RouterStore from 'store/routes';
import AjaxModule from 'services/ajax';
import { SubscriptionCard } from 'components/blocks/block-cards/block-subscription-card/block-subscription-card';

import Button from 'components/fragments/button/button';
import Input from 'components/fragments/input/input';


import './block-subscription-form.scss';

@inject('user')
class BlockSubscriptionForm extends Component {
    constructor(props) {
        super(props);
      
        this.state = { 
            isFree: false,
            subscriptions: [],
        };
        this._form = React.createRef();
    }

    componentDidMount() {
        AjaxModule.get(RouterStore.api.subscriptions.my).then((data) => {
            this.setState({ subscriptions: data || [] });
        }).catch((error) => {
            console.error(error.message);
        });
    }

    handleFreeClick = () => {
        this.setState({ isFree: !this.state.isFree});
    }
    
    render() {
        const { user } = this.props;
        const { subscriptions } = this.state;
        const subscriptionsNodes = subscriptions && subscriptions.map((card, index) => {
            return <SubscriptionCard key={index} subscription={card} current={user} type={SubscriptionCard.types.profile}/>;
        });

        debugger

        return (
            <form ref={this._form} id="subscription_form">
                <div className="form__subscriptions">
                    {subscriptionsNodes.length !== 0 ? 
                    ( 
                        <>
                            <div className="form__subscriptions-title">Мои подписки</div>
                            <div className="form__subscriptions-items">
                                {subscriptionsNodes}
                            </div>
                        </>
                    ) : (
                        <div>Автор пока не добавил подписок</div>
                    )}
                </div>

                <div className="form__inputs">
                    <div className="subscription-header">Создание новой подписки</div>
                    <div className="form-input input-title">
                        <Input label="Заголовок" type={Input.types.text} name="title" placeholder="Добавьте заголовок"/>
                    </div>
                    <div className="form-input input-description">
                        <Input label="Описание" type={Input.types.textarea} name="description" placeholder="Напишите что-нибудь..."/>
                    </div>
                    <div className="form__controls-subscription">
                        <div className="form-control text-price">
                            Вы можете создать платную или бесплатную подписку. Для платной подписки укажите стоимоть в месяц. Минимальная стоимость платной подписки - 16 ₽.
                        </div>
                        <div className="form-control control-price">
                            <div className='bottom__free-checkbox'>
                                <Input type={Input.types.checkbox} name="freeCheckbox" label="Бесплатно" id="freeCheckbox" material={true} onAction={this.handleFreeClick} checked={this.state.isFree}/>
                            </div>
                            {!this.state.isFree && <div className="control-price__input">
                                <Input label="₽" type={Input.types.number} name="price" min={16} defaultValue={16} placeholder="Цена"/>
                            </div>}
                        </div>
                        <div className="form-control control-button">    
                            <Button text="Создать подписку" type={Button.types.submit} isDisabled={this.state.isDisabled} onAction={this.handleCreateSubscriptionClick}/>
                        </div>
                    </div>
                </div>
            </form>
        );
    }

    handleCreateSubscriptionClick = (event) => {
        event.preventDefault();

        const form = this._form.current;
        let reqBody = {
            title: form.title.value,
            description: form.description.value,
            sum: form.price ? +form.price?.value : 0,
        };

        AjaxModule.post(RouterStore.api.subscriptions.new, reqBody).then((data) => {
            this.setState({ subscriptions: data });
            this.clearInputs();
        }).catch((error) => {
            console.error(error.message);
        });
    }

    clearInputs = () => {
        const form = this._form.current;

        this.setState({ isFree: false});

        form.title.value = "";
        form.description.value = "";
        form.price.value = 16;
    }
}

export { BlockSubscriptionForm };
