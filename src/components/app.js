import React from 'react';
import {connect} from 'react-redux';
import {Route, withRouter} from 'react-router-dom';
import IdleTimer from 'react-idle-timer'

import HeaderBar from './header-bar';
import LandingPage from './landing-page';
import Dashboard from './dashboard';
import RegistrationPage from './registration-page';
import {refreshAuthToken, clearAuth} from '../actions/auth';
import {clearAuthToken} from '../local-storage';

export class App extends React.Component {
    constructor(props) {
        super(props)
        this.idleTimer = null
        this.onActive = this._onActive.bind(this)
        this.onIdle = this._onIdle.bind(this)
      }

    componentDidUpdate(prevProps) {
        if (!prevProps.loggedIn && this.props.loggedIn) {
            // When we are logged in, refresh the auth token periodically
            this.startPeriodicRefresh();
        } else if (prevProps.loggedIn && !this.props.loggedIn) {
            // Stop refreshing when we log out
            this.stopPeriodicRefresh();
        }
    }

    componentWillUnmount() {
        this.stopPeriodicRefresh();
    }

    startPeriodicRefresh() {
        this.refreshInterval = setInterval(
            () => this.props.dispatch(refreshAuthToken()),
            10 * 60 * 1000 // 10 min
        );
    }

    stopPeriodicRefresh() {
        if (!this.refreshInterval) {
            return;
        }

        clearInterval(this.refreshInterval);
    }

    logOut() {
        this.props.dispatch(clearAuth());
        clearAuthToken();
    }

    render() {
        return (
            <div className="app">
                <IdleTimer
                    ref={ref => { this.idleTimer = ref }}
                    element={document}
                    onActive={this.onActive}
                    onIdle={this.onIdle}
                    timeout={1000 * 15}>
            
                    <h1>Child Components</h1>
            
                </IdleTimer>
                <HeaderBar />
                <Route exact path="/" component={LandingPage} />
                <Route exact path="/dashboard" component={Dashboard} />
                <Route exact path="/register" component={RegistrationPage} />
            </div>
        );
    }

    _onActive(e) {
        console.log('user is active', e)
        console.log('time remaining', this.idleTimer.getRemainingTime())
      }
     
      _onIdle(e) {
        console.log('user is idle', e);
        console.log('last active', this.idleTimer.getLastActiveTime());
        this.logOut();
      }
}

const mapStateToProps = state => ({
    hasAuthToken: state.auth.authToken !== null,
    loggedIn: state.auth.currentUser !== null
});

// Deal with update blocking - https://reacttraining.com/react-router/web/guides/dealing-with-update-blocking
export default withRouter(connect(mapStateToProps)(App));
