import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import RouterStore from 'store/routes';

import Button from 'components/fragments/button/button';
import Input from 'components/fragments/input/input';
import Select from 'components/fragments/select/select';

import AjaxModule from 'services/ajax';
import { validate, FIELDS_TYPES, FILES_TYPES } from 'services/validation';
import { getRouteWithID } from 'services/getRouteWithId';

import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, convertFromRaw, RichUtils, Modifier, ContentState, convertFromHTML, AtomicBlockUtils  } from 'draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import embed from "embed-video";

import embeddedIcon from 'assets/img/video.svg';

import './block-post-from.scss';

class BlockPostForm extends Component {
    constructor(props) {
        super(props);
        //   const editorState = EditorState.createWithContent(contentState);
      
        this.state = { 
            fileIDs: [], 
            postID: 0, 
            activities: [],
            subscriptions: [],
            visibleTypes: [],
            showSubscriptions: true, 
            showPrice: false, 
            disabledButton: false, 
            redirect: false,
            errors: {
                title: null,
                description: null,
                file: null,
                subscription: null,
                sum: null,
            },
            // editorState: EditorState.createWithContent(contentState),
            editorState: EditorState.createEmpty(),
        };
        this.handleSubscription = this.handleSubscription.bind(this);
        this.handleCreatePostClick = this.handleCreatePostClick.bind(this);
        this.handleSendFile = this.handleSendFile.bind(this);
        this._form = React.createRef();
    }

    uploadImageCallBack = (file) => {
        return new Promise(
            (resolve, reject) => {
              const reader = new FileReader(); // eslint-disable-line no-undef
              reader.onload = e => resolve({ data: { link: e.target.result } });
              reader.onerror = e => reject(e);
              reader.readAsDataURL(file);
            });
    }

    componentDidMount() {
        AjaxModule.get(RouterStore.api.activities).then((data) => {
            this.setState({ activities: data || [] });
        }).catch((error) => {
            console.error(error.message);
        });

        AjaxModule.get(RouterStore.api.visible_types).then((data) => {
            this.setState({ visibleTypes: data || [] });
        }).catch((error) => {
            console.error(error.message);
        });

        AjaxModule.get(RouterStore.api.subscriptions.my).then((data) => {
            let tempData = data || [];
            const defaultItem = {
                id: 0, value:'0', title:'Без подписки'
            };
            tempData.splice(0, 0, defaultItem);
            this.setState({ subscriptions: tempData });
        }).catch((error) => {
            console.error(error.message);
        });
    }

    onEditorStateChange = (editorState) => {
        this.setState({
          editorState,
        });
        // console.log(convertToRaw(editorState.getCurrentContent()));
    };

    mediaBlockRenderer = (block) => {
        if (block.getType() === 'atomic') {
          return {
            component: this.Media,
            editable: false,
          };
        }
      
        return null;
    }


    Media = (props) => {
        const entity = props.contentState.getEntity(
          props.block.getEntityAt(0)
        );
        const {src} = entity.getData();
        const type = entity.getType().toLowerCase();
      
        let media = null;
        if (type === 'audio') {
          media = <Audio src={src} />;
        } else if (type === 'image') {
          media = <Image src={src} />;
        } else if (type === 'video') {
          media = <Video src={src} />;
        }
      
        return media;
    };
         
    
    render() {
        const { activities, visibleTypes, subscriptions, redirect, errors, postID, editorState } = this.state;

        const visibleTypeSelect = visibleTypes.map((type) => {
            return {
                id: type.id,
                value: type.id.toString(),
                text: type.title,
            };
        });
        const subscriptionSelect = subscriptions.map((subscription) => {
            return {
                id: subscription.id,
                value: subscription.id.toString(),
                text: subscription.title,
            };
        });
        const activitySelect = activities.map((activity) => {
            return {
                id: activity.id,
                value: activity.id.toString(),
                text: activity.label,
            };
        });

        const teaserPlaceholder =  'Напишите тизер, чтобы пользователи, у которых ещё нет доступа к посту, могли понять о чём вы пишите. Используйте это краткое описание для привлечения новых подписчиков...(опционально)';
        const postRoute = getRouteWithID(RouterStore.api.posts.id, postID);  
        
        if (redirect) {
            return <Redirect to={postRoute} />;
        }
        return (
            <form ref={this._form} id="post_form">
                <div className="form__inputs">
                    <div className="form-input input-title">
                        <Input
                            label="Заголовок"
                            type={Input.types.text}
                            name="title"
                            placeholder="Добавьте заголовок"
                            error={errors.title}
                            isRequired={true}
                        />
                    </div>
                    <div className="form-input input-description">
                        <label className="textarea-label">Содержание<span style={{color: 'red'}}> *</span></label>
                        <Editor
                            blockRendererFn={this.mediaBlockRenderer}
                            editorState={editorState}
                            wrapperClassName="form-input input-description"
                            editorClassName="input-description__editor"
                            onEditorStateChange={this.onEditorStateChange}
                            placeholder = 'Напишите что-нибудь...'
                            // toolbarHidden={true}
                            toolbar={{
                                options: ['emoji', 'link', 'embedded', 'image', 'history'],
                                image: { 
                                    uploadCallback: this.uploadImageCallBack, 
                                    previewImage: true,
                                },
                                link: {
                                    linkCallback: params => ({ ...params }),
                                    options: ['link'],
                                  },
                                embedded: {
                                    icon: embeddedIcon,  
                                    embedCallback: link => {
                                        const detectedSrc = /<iframe.*? src="(.*?)"/.exec(embed(link));
                                        return (detectedSrc && detectedSrc[1]) || link;
                                    }
                                }
                                
                              }}
                              localization={{
                                locale: 'ru',
                              }}

                              toolbarCustomButtons={[<MusicToolbarButton onChange={this.getEditorState}/>]}
                            />
                        {/* <Input
                            label="Содержание"
                            type={Input.types.textarea}
                            name="description"
                            placeholder="Напишите что-нибудь..."
                            error={errors.description}
                            isRequired={true}
                        /> */}
                        
                    </div>
                    <div className="form-input input-teaser">
                        <Input label="Тизер" type={Input.types.textarea} name="teaser" placeholder={teaserPlaceholder}/>
                    </div>
                    {/* <div className="form-input input-file">
                        <Input
                            label="Загрузите изображение"
                            fileTypes={FILES_TYPES}
                            text="Прикрепить изображение"
                            type={Input.types.file}
                            name="file"
                            id="file-input"
                            onAction={this.handleSendFile}
                            error={errors.file}
                        />
                    </div> */}
                </div>

                <div className="form__controls">
                    <div className="form-control control-button">    
                        <Button text="Опубликовать" type={Button.types.submit} name="createPost" isDisabled={this.state.isDisabled} onAction={this.handleCreatePostClick}/>
                    </div>
                    <div className="form-control control-select-visible">
                        <Select classValue='form-control__select' label="Уровень приватности поста" name="visibleTypes" actionType={Select.events.change} onAction={this.handleSubscription} values={visibleTypeSelect}/>
                    </div>
                    {errors.subscription && <span className="form-input__error no-subscriptions">{errors.subscription}</span>}
                    {this.state.showPrice && <div className="form-control control-price">
                        <label className='price-label'>Стоимость разовой оплаты поста</label>
                        <div className="control-price__input">
                            <Input
                                label="₽"
                                type={Input.types.number}
                                name="price"
                                min={16}
                                defaultValue={16}
                                error={errors.sum}
                            />
                        </div>
                        {errors.sum && <span className="form-input__error sum-error">{errors.sum}</span>}
                    </div>}
                    {this.state.showSubscriptions && <div className="form-control control-subscription">
                        <Select classValue='form-control__select' label="Выберите подпискy" name="subscription" values={subscriptionSelect}/>
                    </div>}
                    <div className="form-control control-select-activity">
                        <Select classValue='form-control__select' label="Категория деятельности" name="activity" values={activitySelect}/>
                    </div>
                </div>
            </form>
        );
    }

    handleSubscription = (event) => {
        const { subscriptions } = this.state;
        const visibleType = event.target[event.target.selectedIndex].value;
        if ((visibleType === '2' || visibleType === '3') && subscriptions.length === 0) {
            this.setState({
                errors: {
                    subscription: 'У вас нет ни одной подписки. Выбранная приватность сброшена'
                },
                showSubscriptions: true,
                showPrice: false,
            }, () => event.target.selectedIndex = 0);
            return;
        }

        this.setState({
            errors: {
                subscription: null
            }
        });

        if (visibleType !== '4') {
            this.setState({showSubscriptions: true});
        } else {
            this.setState({showSubscriptions: false});
        }

        if (visibleType === '3' || visibleType === '4') {
            this.setState({showPrice: true});
        } else {
            this.setState({showPrice: false});
        } 
    };

    handleSendFile() {
        const form = this._form.current;
        this.setState({
            errors: {
                file: validate(form.file?.files[0], FIELDS_TYPES.FILE),
            }
        }, this._makeFileRequest);
    }

    _makeFileRequest() {
        const { errors } = this.state;
        const form = this._form.current;
        const isFileInvalid = Boolean(errors.file);
        if (!isFileInvalid) {
            const reqBody = form.file.files[0];
            this.setState({isDisabled: Input.startLoader()}, this.checkDisabledButtonStyle);
            const data = new FormData();
            // TODO временно шлем ток картинки
            data.append('image', reqBody, reqBody.name);
            AjaxModule.doAxioPost(RouterStore.api.posts.file.new, data, 'multipart/form-data')
                .then((response) => {
                    if (response.data?.status) {
                        throw new Error(response.data?.message);
                    }
                    this.setState((prevState => ({
                        fileIDs: [...prevState.fileIDs, response.data]
                    })));
                    this.setState({isDisabled: Input.finishLoader(true)}, this.checkDisabledButtonStyle);
                })
                .catch((error) => {
                    console.log(error);
                    this.setState({
                        isDisabled: Input.finishLoader(),
                        errors: {
                            file: error.message,
                        }
                    }, this.checkDisabledButtonStyle);
                });
        }
    }

    checkDisabledButtonStyle = () => {
        const buttonSubmit = document.querySelector('div.form-control.control-button input');
        if (this.state.isDisabled) {
            buttonSubmit.classList.add('disabled');
        } else {
            buttonSubmit.classList.remove('disabled');
        }
    };

    getEditorState = (state) => {
        this.setState({ editorState: state });
    }

    handleCreatePostClick(event) {
        event.preventDefault();

        const editorState = this.state.editorState;


        console.log(JSON.stringify(convertToRaw(editorState.getCurrentContent())));
        const blocks = convertToRaw(editorState.getCurrentContent()).blocks;
        const value = blocks.map(block => (!block.text.trim() && '\n') || block.text).join('\n');
        console.log(value);

        // const form = this._form.current;
        // this.setState({
        //     errors: {
        //         title: validate(form.title?.value, FIELDS_TYPES.TITLE),
        //         //description: validate(form.description?.value, FIELDS_TYPES.CONTENT),
        //         sum: form.price ? validate(form.price?.value, FIELDS_TYPES.SUM) : null,
        //     }
        // }, this._makeRequest);
    }

    _makeRequest() {
        const { errors } = this.state;
        const form = this._form.current;
        const isFormValid = Array.from(Object.values(errors)).filter(error => Boolean(error)).length === 0;
        if (isFormValid) {
            const body = {
                title: form.title.value,
                description: form.description.value,
                teaser: form.teaser.value,
                subscription_id: form.subscription ?+form.subscription.options[form.subscription.selectedIndex].id : 0,
                sum: form.price ? +form.price.value : 0,
                visible_type_id: +form.visibleTypes.options[form.visibleTypes.selectedIndex].id,
                file_ids: this.state.fileIDs,
                activity_id: +form.activity.options[form.activity.selectedIndex].id,
            };

            AjaxModule.doAxioPost(RouterStore.api.posts.new, body).then((response) => {
                if (response.status !== 201) {
                    throw new Error(response.data?.message || 'Не удалось создать пост');
                }
                this.setState({ postID: response.data.id });
                this.setState({ redirect: true });
            }).catch((error) => {
                // TODO: нотифайку, что не удалось создать пост
                console.error(error.message);
            });
        }
    }
}

class MusicToolbarButton extends Component {
    uploadImageCallBack = () => {
            var url;
            var ffile = document.querySelector("#music__file");
            var file = ffile.files[0];
            debugger
            var reader = new FileReader();
            reader.onload = function(evt) {
              url = evt.target.result;
              console.log(url);
              var sound = document.createElement("audio");
              var link = document.createElement("source");
              sound.id = "audio-player";
              sound.controls = "controls";
              link.src = url;
              document.querySelector("#music__control").src = url;
              sound.type = "audio/mpeg";
              debugger
              return url;
            };
            if (!file) return '';
            reader.readAsDataURL(file);
            return url;
    }

    addElem = () => {
        const { editorState, onChange } = this.props;

        const url = this.uploadImageCallBack();

        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(
            'audio',
            'IMMUTABLE',
            {src: url}
        );
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    
        const newEditorState = EditorState.set(
            editorState,
            {currentContent: contentStateWithEntity}
        );
   
        onChange(AtomicBlockUtils.insertAtomicBlock(
            newEditorState,
            entityKey,
            ' '
        ));
      };
  
    render() {
      return (
        <>
            <label htmlFor='music__file'>
                <div className="rdw-storybook-custom-option" onClick={this.addElem}>Music</div>
            </label>
            <input type="file" className='file-input' id='music__file' onChange={this.uploadImageCallBack}/>
        </>
      );
    }
  }

class Audio extends Component {
    render () {
        return (
            // <audio controls src='/home/kate/Музыка/test.mp3' />
            <audio id='music__control' controls />
        )   
    }
    
}

class Image extends Component {
    render () {
        return (
            <div className='rdw-image-imagewrapper'>
                <img src={this.props.src} />
            </div>
        )   
    }
    
}


export default BlockPostForm;
