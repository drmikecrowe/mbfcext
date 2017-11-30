import * as React from 'react'
import PropTypes from 'prop-types'

import storage from '../utils/storage'

const OptionHeader = () => (
  <div className='grid'>
    <div className='unit whole center-on-mobiles'>
      <div className='heading'>
        <h1>Extension Boilerplate</h1>
        <p className='lead'>A foundation for creating cross-browser extensions</p>
      </div>
    </div>
  </div>
)

const OptionFooter = () => (
  <footer className='main-footer'>
    <div className='grid'>
      <div className='unit whole center-on-mobiles'>
        <p className='text-center text-muted'>
          &copy; Extension Boilerplate
        </p>
      </div>
    </div>
  </footer>
)

const ColorOptions = (props) => (
  <div className='radio-group'>
    { props.colors.map((item, i) => (
      <label key={i}>
        <input type='radio' name='radio' value={item.color}
          checked={props.curColor === item.color}
          onChange={props.onSelected} />{item.label}
      </label>
    )) }
  </div>
)

// ColorOptions.propTypes = {
//   colors: PropTypes.array.isRequire,
//   onSelected: PropTypes.func.isRequire
// }

class OptionPanel extends React.Component<any, any> {
  constructor (props) {
    super(props)
    this.state = {
      selectedColor: 'white',
      colors: [
        { color: 'white', label: 'White' },
        { color: 'beige', label: 'Beige' },
        { color: 'lavender', label: 'Lavender' }
      ]
    }
  }

  _changeColor = (color) => {
    document.body.style.backgroundColor = color
    this.setState({ ...this.state, selectedColor: color })
  }

  componentDidMount () {
    setTimeout(() => {
      storage.get('color', (resp) => {
        if (resp && resp.color) {
          this._changeColor(resp.color)
        }
      })
    }, 0)
  }

  onColorSelected = (event) => {
    const color = event.target.value
    storage.set({ color }, () => {
      this._changeColor(color)
    })
  }

  render () {
    return (
      <div className='wrap'>
        <OptionHeader />

        <section className='content'>
          <div className='grid'>
            <div className='unit whole center-on-mobiles'>
              <div className='option'>
                <h5>Popup color</h5>
                <ColorOptions
                  colors={this.state.colors}
                  curColor={this.state.selectedColor}
                  onSelected={this.onColorSelected} />
              </div>
              <div className='option'>
                <em className='text-muted'>...display your extensions' options here...</em>
              </div>
            </div>
          </div>
        </section>

        <OptionFooter />
      </div>
    )
  }
}

export default OptionPanel
