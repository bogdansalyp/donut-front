import React, { Component } from 'react';

import AjaxModule from "services/ajax";
import RouteStore from "store/routes";

import ArrowDownIcon from 'assets/img/select-arrow.svg';

import Button from 'components/fragments/button/button';
import Input from 'components/fragments/input/input';
import Select from 'components/fragments/select/select';


import './block-search.scss';

class BlockSearch extends Component {
    constructor(props) {
        super(props);

        this._form = React.createRef();
        this.state = {
            showSubscritionsPrices: false,
            freeSubscritionsChecked: false,
            selectedActivities: [],
        };
        this.toggleSubscritionsPrices = this.toggleSubscritionsPrices.bind(this);
        this.toggleFreeSubscritions = this.toggleFreeSubscritions.bind(this);
    }

    getSelectedActivities = (activities) => {
        this.setState({ selectedActivities: activities });
    }

    handleSubmit = (event) => {
        event.preventDefault();
        
        const form = this._form.current;

        let keys = {
            data_type: form.postType.value,
        };

        let activitiesIDs = this.state.selectedActivities.map((value) => { return +value.id });
        if (activitiesIDs.length !== 0) {
            keys.activities = activitiesIDs;
        }

        if (form.search.value !== "") {
            keys.text = form.search.value;
        }

        if (form.freeCheckbox.checked && form.subscritionCheckbox.checked) {
            keys.min_price = 0;
            keys.max_price = +form.subscritionNumberMax.value;
        }
        if (!form.freeCheckbox.checked && form.subscritionCheckbox.checked) {
            keys.min_price = +form.subscritionNumberMin.value;
            keys.max_price = +form.subscritionNumberMax.value;
        }
        if (form.freeCheckbox.checked && !form.subscritionCheckbox.checked) {
            keys.min_price = 0;
            keys.max_price = 0;
        }

        const { onClick } = this.props;
        onClick && onClick(keys);
    };

    toggleSubscritionsPrices() {
        this.setState({ showSubscritionsPrices: !this.state.showSubscritionsPrices}, this.checkCheckboxes);
        
    }

    checkCheckboxes = () => {
        // если нажата галочка "Бесплатно" и "По подписке" одновременно, мин. цену принимает за 0
        const form = this._form.current;
        if (this.state.showSubscritionsPrices && this.state.freeSubscritionsChecked) {
            form.subscritionNumberMin.value = 0;
            form.subscritionNumberMin.disabled = true;
        } else {
            if (form.subscritionNumberMin) {
                form.subscritionNumberMin.value = '';
                form.subscritionNumberMin.disabled = false;                
            }
        }
    }

    toggleFreeSubscritions() {
        this.setState({ freeSubscritionsChecked: !this.state.freeSubscritionsChecked}, this.checkCheckboxes);
    }

    render() {
        const postTypes = [
            {id: 1, value:'all', text:'Везде'},
            {id: 2, value:'posts', text: 'По постам'},
            {id: 3, value:'subscriptions', text: 'По подпискам'},
            {id: 4, value:'authors', text: 'По авторам'},
        ]; 

        return (
            <div className='search'>
                <form ref={this._form} className="search-form">
                    <div className='search__top'>
                        <div className='top__type-selector'>
                            <Select values={postTypes} classValue='type-selector' id='type-selector' name='postType'/>     
                        </div>
                        <div className='top__search-input'>
                            <Input type={Input.types.text} name="search" placeholder="Я ищу..."/>
                        </div>
                        <div className='top__search-button'>
                            <Button text="Найти" type={Button.types.submit} onAction={this.handleSubmit}/>
                        </div>
                    </div>
                    <div className='search__bottom'>
                        <div className='bottom__free-checkbox'>
                            <Input type={Input.types.checkbox} name="freeCheckbox" label="Бесплатно" material={true} onAction={this.toggleFreeSubscritions}/>
                        </div>
                        <div className='bottom__subscrition'>
                            <Input type={Input.types.checkbox} name="subscritionCheckbox" label='По подписке ' material={true} onAction={this.toggleSubscritionsPrices}/>
                            {this.state.showSubscritionsPrices && <label>от</label>}
                            {this.state.showSubscritionsPrices && <Input type={Input.types.number} name="subscritionNumberMin" min={0} max={2147483647} label="₽"/>}
                            {this.state.showSubscritionsPrices && <label>до</label>}
                            {this.state.showSubscritionsPrices && <Input type={Input.types.number} name="subscritionNumberMax" min={0} max={2147483647} label="₽"/>}
                        </div>
                        <div className='bottom__select-activity'>
                            <ActivitiesSelect onChange={this.getSelectedActivities}/>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

export default BlockSearch;

class ActivitiesSelect extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activities: [],
            selectedActivities: [],
            showАctivities: false,
            showАctivitiesList: false,
        };
        this.toggleSelectedActivity = this.toggleSelectedActivity.bind(this);
        this._activitiesSelector = React.createRef();
    }

    componentDidMount() {
        AjaxModule.get(RouteStore.api.activities).then((data) => {
            this.setState({ activities: data || [] });
        }).catch((error) => {
            console.error(error.message);
        });
        document.addEventListener('click', this.handleClickActivitiesOutside, true);
    }
    
    componentWillUnmount() {
        document.removeEventListener('click', this.handleClickActivitiesOutside, true);
    }
    
    handleClickActivitiesOutside = event => {
        const domNode = this._activitiesSelector.current;
    
        if ((!domNode || !domNode.contains(event.target)) && this._activitiesSelector.current.style.visibility === 'visible') {
            this.setState({
                showАctivities: false
            });
        }
    }

    toggleSelectedActivity(event) {
        let newItem = {
            id: event.target.id,
            name: event.target.name
        };
        let foundItem = this.state.selectedActivities.find(item => item.id === newItem.id);
        let tempArray = this.state.selectedActivities;
        if (!foundItem) {
            tempArray.push(newItem);
        } else {
            let removeIndex = tempArray.map(function(item) { return item.id; }).indexOf(foundItem.id);
            tempArray.splice(removeIndex, 1);
        } 

        this.setState({selectedActivities: tempArray}, () => {
            const { onChange } = this.props;
            onChange && onChange(this.state.selectedActivities);
        });
    }

    openActivityDisplay = () => {
        this.setState({showАctivities: true});
    }

    handleListTitleClick = () => {
        //TODO починить закрытие/открытие с учетом нажатий вне компонента
        if (this._activitiesSelector.current.style.visibility === 'hidden') {
            this.setState({showАctivities: true});
        } else {
            this.setState({showАctivities: false});
        }        
    }

    render() {
        const { activities, selectedActivities } = this.state;
        const activitiesNodes = activities.map((activity, index) => {
            if (activity.label === 'Все') return;
            return <Input type={Input.types.checkbox} onAction={this.toggleSelectedActivity} material={true} name={activity.label} key={index} id={activity.id} label={activity.label} classValue="select__activities-items"/>
        });

        const selectedActivitiesNodes = selectedActivities.map((activity, index) => {
            return <SelectedActivity activity={activity.name} id={activity.id} key={index}/>;
        });

        let roundBorders = this.state.selectedActivities.length !== 0 && !this.state.showАctivities? 'round-borders' : '';

        return (
            <>
                {(!this.state.showАctivities && this.state.selectedActivities.length === 0) && 
                    <div 
                        className='select-activity__default' 
                        onClick={this.openActivityDisplay}>
                        Выберите тематики 
                        <img src={ArrowDownIcon}/>
                    </div>}
                {(this.state.showАctivities || this.state.selectedActivities.length !== 0) && 
                <div 
                    className={ `select-activity__list-title ${roundBorders}` }
                    name="activities" 
                    onClick={this.handleListTitleClick}>
                        Тематики: {selectedActivitiesNodes}
                </div>}
                <div 
                    ref = {this._activitiesSelector}
                    className='select-activity__list' 
                    name="activities" 
                    style={{visibility: !this.state.showАctivities ? 'hidden' : 'visible'}}>
                        {activitiesNodes}
                </div>
            </>
        );
    }
}


class SelectedActivity extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showActivity: true,
        }
    }

    render() {
        const { activity, id } = this.props;
        return (
            <>
                { this.state.showActivity && <div className="selected-activity" id={id}>
                    {activity}
                </div>}
            </>
        );
    }
}