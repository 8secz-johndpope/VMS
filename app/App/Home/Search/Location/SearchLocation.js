/* eslint-disable consistent-this */
/* eslint-disable eqeqeq */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  CommonStyle,
  JFLMap,
  I18n,
  Loading,
  HttpUtils,
  Toast,
  BaseComponent,
} from '../../../Common/index';
import {Container, Text, Grid, Row} from 'native-base';
import {LocationBottom} from '../SearchComponent';

///搜索结果-定位
export default class SearchLocation extends BaseComponent {
  static navigationOptions = () => ({
    headerTitle: () => (
      <Text style={CommonStyle.navGreenStyle}>{I18n.t('location')}</Text>
    ),
  });

  constructor(props) {
    super(props);
    this.state = {
      refresh: false,
      data: null,
    };
  }

  render() {
    var data = this.state.data;
    return (
      <Container>
        <Grid>
          <Row>
            <JFLMap
              ref={ref => {
                this.JFLMap = ref;
              }}
              style={{flex: 1}}
            />
          </Row>
          {data ? (
            <Row style={{height: 151}}>
              <LocationBottom
                ref={ref => {
                  this.LocationBottom = ref;
                }}
                data={data}
                clickDetailsBtn={index =>
                  this._clickDetailsBottomBtn(index, data)
                }
              />
            </Row>
          ) : null}
        </Grid>
        {this.state.refresh ? <Loading /> : null}
      </Container>
    );
  }

  componentDidMount() {
    // const data = this.props.navigation.state.params.data;
    // this.JFLMap.setLocationItem(data);
    this.getData();
  }

  _goToView = (viewName, data) => {
    const {navigate} = this.props.navigation;
    navigate(viewName, {data: data});
  };

  ///点击底部详情上的按钮
  _clickDetailsBottomBtn = (index, data) => {
    if (index == 1) {
      this._goToView('SearchHistory', data);
    } else if (index == 2) {
      this._goToView('SearchDetails', data);
    }
  };

  /**根据车辆id获取车辆位置信息 */
  getData() {
    const data = this.props.navigation.state.params.data;
    const id = data && data._id;
    if (!id) {
      return;
    }
    this.setState({refresh: true});
    var _this = this;
    HttpUtils.postRequest(HttpUtils.AllUrl.Vehicle.Location, true, {
      id: id,
    }).then(response => {
      if (_this.unmount) {
        return;
      }
      _this.setState({refresh: false});
      if (response && response.code === 200) {
        if (response.data) {
          _this.setState({data: response.data});
          if (response.data.device && response.data.device.last_gps_point) {
            _this.JFLMap.setLocationItem(response.data);
          } else {
            Toast.show(I18n.t('location_unable'));
          }
        } else {
          Toast.show(I18n.t('location_unable'));
        }
      } else {
        Toast.show(response.message);
      }
    });
  }
}
