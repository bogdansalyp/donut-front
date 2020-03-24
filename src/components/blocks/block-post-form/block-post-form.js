import React, { Component } from 'react';
import RouterStore from 'store/routes';

import Button from 'components/fragments/button/button';
import Input from 'components/fragments/input/input';
import Textarea from 'components/fragments/textarea/textarea';
import FileInput from 'components/fragments/file-input/file-input';
import Select from 'components/fragments/select/select';

import AjaxModule from 'services/ajax';

import './block-post-from.scss';

class BlockPostForm extends Component {
    constructor(props) {
        super(props);
        
        this.state = { showSubscriptions: false };
        this.showSubscriptionCategory = this.handleSubscriptionCategory.bind(this);
        this.handleCreatePostClick = this.handleCreatePostClick.bind(this);
        this.handleSendFile = this.handleSendFile.bind(this);
        this._form = React.createRef();
    }
    
    render() {
        //TODO get this data from back
        const subscriptionSelect = {
            "For all": "Открыт для всех",
            "Subscribers": "Только по подписке",
            "Subscribers and one time": "Для подписчиков и разовая оплата",
            "One time": "Только разовая оплата",
        }; 
        const subscriptionCategorySelect = {
            "1": "Подписка 1",
            "2": "Подписка 2",
        }; 
        const activitySelect = {
            "Art": "Живопись",
            "Photography": "Фотография",
            "Music": "Музыка",
            "Blog": "Блог",
            "Writing": "Писательство",
        };
        return (
            <form ref={this._form} id="post_form">
                <div className="form__inputs">
                    <div className="form-input input-title">
                        <Input label="Заголовок" type={Input.types.text} name="title" placeholder="Добавьте заголовок"/>
                    </div>
                    <div className="form-input input-description">
                        <Textarea label="Содержание" name="description" placeholder="Напишите что-нибудь..."/>
                    </div>
                    <div className="form-input input-file">
                        <FileInput label="Загрузите файл" name="file" id="file-input" onAction={this.handleSendFile}/>
                    </div>
                </div>

                <div className="form__controls">
                    <div className="form-control control-button">    
                        <Button text="Опубликовать" type={Button.types.submit} onAction={this.handleCreatePostClick}/>
                    </div>
                    <div className="form-control control-select-visible">
                        <Select label="Кто может просматривать пост" actionType={Select.events.change} onAction={this.handleSubscriptionCategory} values={subscriptionSelect}/>
                    </div>
                    <div className="form-control control-subscription-category">
                        {this.state.showSubscriptions && <Select label="Выберите подписку" values={subscriptionCategorySelect}/> }
                    </div>
                    <div className="form-control control-select-activity">
                        <Select label="Категория деятельности" values={activitySelect}/>
                    </div>
                </div>
            </form>
        );
    }

    handleSubscriptionCategory(event) {
        const subscription = "Subscribers";
        const optionValue = event.target[event.target.selectedIndex].value;
        if (optionValue.indexOf(subscription) !== -1) {
            this.setState({showSubscriptions: true});
        } else {
            this.setState({showSubscriptions: false});
        }
        
    }

    handleSendFile() {
        const form = this._form.current;
        const reqBody = form.file.files[0];
        if (reqBody) {
            const data = new FormData();
            data.append('image', reqBody, reqBody.name);  
            AjaxModule.post(RouterStore.api.posts.file.new, data, 'multipart/form-data');
        }
    }

    handleCreatePostClick(event) {
        event.preventDefault();

        const form = this._form.current;
        let reqBody = {
            title: form.title.value,
            description: form.description.value,
                    //TODO договориться с беком о значениях
            subscription_category_id: 1,
            visible_type_id: 1,
            category_id: 1,
        };

        AjaxModule.post(RouterStore.api.posts.new, reqBody);
    }
}

export default BlockPostForm;
