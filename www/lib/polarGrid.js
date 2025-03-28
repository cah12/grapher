/******************************************************************************
 * QwtPolar Widget Library
 * Copyright (C) 2008   Uwe Rathmann
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the Qwt License, Version 1.0
 *****************************************************************************/

#include "qwt_polar_grid.h"
#include "qwt_painter.h"
#include "qwt_text.h"
#include "qwt_clipper.h"
#include "qwt_scale_map.h"
#include "qwt_scale_engine.h"
#include "qwt_scale_div.h"
#include "qwt_scale_draw.h"
#include "qwt_round_scale_draw.h"

#include <qpainter.h>
#include <qpen.h>
#include <float.h>

static inline bool isClose( double value1, double value2 )
{
    return qAbs( value1 - value2 ) < DBL_EPSILON;
}

namespace
{
    class AxisData
    {
      public:
        AxisData()
            : isVisible( false )
            , scaleDraw( NULL )
        {
        }

        ~AxisData()
        {
            delete scaleDraw;
        }

        bool isVisible;
        mutable QwtAbstractScaleDraw* scaleDraw;
        QPen pen;
        QFont font;
    };

    class GridData
    {
      public:
        GridData()
            : isVisible( true )
            , isMinorVisible( false )
        {
        }

        bool isVisible;
        bool isMinorVisible;
        QwtScaleDiv scaleDiv;

        QPen majorPen;
        QPen minorPen;
    };
}

class QwtPolarGrid::PrivateData
{
  public:
    GridData gridData[QwtPolar::ScaleCount];
    AxisData axisData[QwtPolar::AxesCount];
    QwtPolarGrid::DisplayFlags displayFlags;
    QwtPolarGrid::GridAttributes attributes;
};

QwtPolarGrid::QwtPolarGrid()
    : QwtPolarItem( QwtText( "Grid" ) )
{
    m_data = new PrivateData;

    for ( int axisId = 0; axisId < QwtPolar::AxesCount; axisId++ )
    {
        AxisData& axis = m_data->axisData[axisId];
        switch( axisId )
        {
            case QwtPolar::AxisAzimuth:
            {
                axis.scaleDraw = new QwtRoundScaleDraw;
                axis.scaleDraw->setTickLength( QwtScaleDiv::MinorTick, 2 );
                axis.scaleDraw->setTickLength( QwtScaleDiv::MediumTick, 2 );
                axis.scaleDraw->setTickLength( QwtScaleDiv::MajorTick, 4 );
                axis.isVisible = true;
                break;
            }
            case QwtPolar::AxisLeft:
            {
                QwtScaleDraw* scaleDraw = new QwtScaleDraw;
                scaleDraw->setAlignment( QwtScaleDraw::BottomScale );

                axis.scaleDraw = scaleDraw;
                axis.isVisible = false;
                break;
            }
            case QwtPolar::AxisRight:
            {
                QwtScaleDraw* scaleDraw = new QwtScaleDraw;
                scaleDraw->setAlignment( QwtScaleDraw::BottomScale );

                axis.scaleDraw = scaleDraw;
                axis.isVisible = true;
                break;
            }
            case QwtPolar::AxisTop:
            {
                QwtScaleDraw* scaleDraw = new QwtScaleDraw;
                scaleDraw->setAlignment( QwtScaleDraw::LeftScale );

                axis.scaleDraw = scaleDraw;
                axis.isVisible = false;
                break;
            }
            case QwtPolar::AxisBottom:
            {
                QwtScaleDraw* scaleDraw = new QwtScaleDraw;
                scaleDraw->setAlignment( QwtScaleDraw::LeftScale );

                axis.scaleDraw = scaleDraw;
                axis.isVisible = true;
                break;
            }
            default:;
        }
    }

    m_data->attributes = AutoScaling;

    m_data->displayFlags = DisplayFlags();
    m_data->displayFlags |= SmartOriginLabel;
    m_data->displayFlags |= HideMaxRadiusLabel;
    m_data->displayFlags |= ClipAxisBackground;
    m_data->displayFlags |= SmartScaleDraw;
    m_data->displayFlags |= ClipGridLines;

    setZ( 10.0 );
    setRenderHint( RenderAntialiased, true );
}

QwtPolarGrid::~QwtPolarGrid()
{
    delete m_data;
}

int QwtPolarGrid::rtti() const
{
    return QwtPolarItem::Rtti_PolarGrid;
}

void QwtPolarGrid::setDisplayFlag( DisplayFlag flag, bool on )
{
    if ( ( ( m_data->displayFlags & flag ) != 0 ) != on )
    {
        if ( on )
            m_data->displayFlags |= flag;
        else
            m_data->displayFlags &= ~flag;

        itemChanged();
    }
}

bool QwtPolarGrid::testDisplayFlag( DisplayFlag flag ) const
{
    return ( m_data->displayFlags & flag );
}

void QwtPolarGrid::setGridAttribute( GridAttribute attribute, bool on )
{
    if ( bool( m_data->attributes & attribute ) == on )
        return;

    if ( on )
        m_data->attributes |= attribute;
    else
        m_data->attributes &= ~attribute;

    itemChanged();
}

bool QwtPolarGrid::testGridAttribute( GridAttribute attribute ) const
{
    return m_data->attributes & attribute;
}

void QwtPolarGrid::setAxisPen( int axisId, const QPen& pen )
{
    if ( axisId < 0 || axisId >= QwtPolar::AxesCount )
        return;

    AxisData& axisData = m_data->axisData[axisId];
    if ( axisData.pen != pen )
    {
        axisData.pen = pen;
        itemChanged();
    }
}

void QwtPolarGrid::showGrid( int scaleId, bool show )
{
    if ( scaleId < 0 || scaleId >= QwtPolar::ScaleCount )
        return;

    GridData& grid = m_data->gridData[scaleId];
    if ( grid.isVisible != show )
    {
        grid.isVisible = show;
        itemChanged();
    }
}

bool QwtPolarGrid::isGridVisible( int scaleId ) const
{
    if ( scaleId < 0 || scaleId >= QwtPolar::ScaleCount )
        return false;

    return m_data->gridData[scaleId].isVisible;
}

void QwtPolarGrid::showMinorGrid( int scaleId, bool show )
{
    if ( scaleId < 0 || scaleId >= QwtPolar::ScaleCount )
        return;

    GridData& grid = m_data->gridData[scaleId];
    if ( grid.isMinorVisible != show )
    {
        grid.isMinorVisible = show;
        itemChanged();
    }
}

bool QwtPolarGrid::isMinorGridVisible( int scaleId ) const
{
    if ( scaleId < 0 || scaleId >= QwtPolar::ScaleCount )
        return false;

    return m_data->gridData[scaleId].isMinorVisible;
}

void QwtPolarGrid::showAxis( int axisId, bool show )
{
    if ( axisId < 0 || axisId >= QwtPolar::AxesCount )
        return;

    AxisData& axisData = m_data->axisData[axisId];
    if ( axisData.isVisible != show )
    {
        axisData.isVisible = show;
        itemChanged();
    }
}

bool QwtPolarGrid::isAxisVisible( int axisId ) const
{
    if ( axisId < 0 || axisId >= QwtPolar::AxesCount )
        return false;

    return m_data->axisData[axisId].isVisible;
}

void QwtPolarGrid::setPen( const QPen& pen )
{
    bool isChanged = false;

    for ( int scaleId = 0; scaleId < QwtPolar::ScaleCount; scaleId++ )
    {
        GridData& grid = m_data->gridData[scaleId];
        if ( grid.majorPen != pen || grid.minorPen != pen )
        {
            grid.majorPen = pen;
            grid.minorPen = pen;
            isChanged = true;
        }
    }
    for ( int axisId = 0; axisId < QwtPolar::AxesCount; axisId++ )
    {
        AxisData& axis = m_data->axisData[axisId];
        if ( axis.pen != pen )
        {
            axis.pen = pen;
            isChanged = true;
        }
    }
    if ( isChanged )
        itemChanged();
}

void QwtPolarGrid::setFont( const QFont& font )
{
    bool isChanged = false;
    for ( int axisId = 0; axisId < QwtPolar::AxesCount; axisId++ )
    {
        AxisData& axis = m_data->axisData[axisId];
        if ( axis.font != font )
        {
            axis.font = font;
            isChanged = true;
        }
    }
    if ( isChanged )
        itemChanged();
}

void QwtPolarGrid::setMajorGridPen( const QPen& pen )
{
    bool isChanged = false;

    for ( int scaleId = 0; scaleId < QwtPolar::ScaleCount; scaleId++ )
    {
        GridData& grid = m_data->gridData[scaleId];
        if ( grid.majorPen != pen )
        {
            grid.majorPen = pen;
            isChanged = true;
        }
    }
    if ( isChanged )
        itemChanged();
}

void QwtPolarGrid::setMajorGridPen( int scaleId, const QPen& pen )
{
    if ( scaleId < 0 || scaleId >= QwtPolar::ScaleCount )
        return;

    GridData& grid = m_data->gridData[scaleId];
    if ( grid.majorPen != pen )
    {
        grid.majorPen = pen;
        itemChanged();
    }
}

QPen QwtPolarGrid::majorGridPen( int scaleId ) const
{
    if ( scaleId < 0 || scaleId >= QwtPolar::ScaleCount )
        return QPen();

    const GridData& grid = m_data->gridData[scaleId];
    return grid.majorPen;
}

void QwtPolarGrid::setMinorGridPen( const QPen& pen )
{
    bool isChanged = false;

    for ( int scaleId = 0; scaleId < QwtPolar::ScaleCount; scaleId++ )
    {
        GridData& grid = m_data->gridData[scaleId];
        if ( grid.minorPen != pen )
        {
            grid.minorPen = pen;
            isChanged = true;
        }
    }
    if ( isChanged )
        itemChanged();
}

void QwtPolarGrid::setMinorGridPen( int scaleId, const QPen& pen )
{
    if ( scaleId < 0 || scaleId >= QwtPolar::ScaleCount )
        return;

    GridData& grid = m_data->gridData[scaleId];
    if ( grid.minorPen != pen )
    {
        grid.minorPen = pen;
        itemChanged();
    }
}

QPen QwtPolarGrid::minorGridPen( int scaleId ) const
{
    if ( scaleId < 0 || scaleId >= QwtPolar::ScaleCount )
        return QPen();

    const GridData& grid = m_data->gridData[scaleId];
    return grid.minorPen;
}

QPen QwtPolarGrid::axisPen( int axisId ) const
{
    if ( axisId < 0 || axisId >= QwtPolar::AxesCount )
        return QPen();

    return m_data->axisData[axisId].pen;
}

void QwtPolarGrid::setAxisFont( int axisId, const QFont& font )
{
    if ( axisId < 0 || axisId >= QwtPolar::AxesCount )
        return;

    AxisData& axisData = m_data->axisData[axisId];
    if ( axisData.font != font )
    {
        axisData.font = font;
        itemChanged();
    }
}

QFont QwtPolarGrid::axisFont( int axisId ) const
{
    if ( axisId < 0 || axisId >= QwtPolar::AxesCount )
        return QFont();

    return m_data->axisData[axisId].font;
}

void QwtPolarGrid::draw( QPainter* painter,
    const QwtScaleMap& azimuthMap, const QwtScaleMap& radialMap,
    const QPointF& pole, double radius,
    const QRectF& canvasRect ) const
{
    updateScaleDraws( azimuthMap, radialMap, pole, radius );

    painter->save();

    if ( testDisplayFlag( ClipAxisBackground ) )
    {
        QRegion clipRegion( canvasRect.toRect() );
        for ( int axisId = 0; axisId < QwtPolar::AxesCount; axisId++ )
        {
            const AxisData& axis = m_data->axisData[axisId];
            if ( axisId != QwtPolar::AxisAzimuth && axis.isVisible )
            {
                QwtScaleDraw* scaleDraw = static_cast< QwtScaleDraw* >( axis.scaleDraw );
                if ( scaleDraw->hasComponent( QwtScaleDraw::Labels ) )
                {
                    const QList< double >& ticks =
                        scaleDraw->scaleDiv().ticks( QwtScaleDiv::MajorTick );
                    for ( int i = 0; i < int( ticks.size() ); i++ )
                    {
                        if ( !scaleDraw->scaleDiv().contains( ticks[i] ) )
                            continue;

                        QRect labelRect =
                            scaleDraw->boundingLabelRect( axis.font, ticks[i] );

                        const int margin = 2;
                        labelRect.adjust( -margin, -margin, margin, margin );

                        if ( labelRect.isValid() )
                            clipRegion -= QRegion( labelRect );
                    }
                }
            }
        }
        painter->setClipRegion( clipRegion );
    }

    //  draw radial grid

    const GridData& radialGrid = m_data->gridData[QwtPolar::Radius];
    if ( radialGrid.isVisible && radialGrid.isMinorVisible )
    {
        painter->setPen( radialGrid.minorPen );

        drawCircles( painter, canvasRect, pole, radialMap,
            radialGrid.scaleDiv.ticks( QwtScaleDiv::MinorTick ) );
        drawCircles( painter, canvasRect, pole, radialMap,
            radialGrid.scaleDiv.ticks( QwtScaleDiv::MediumTick ) );
    }
    if ( radialGrid.isVisible )
    {
        painter->setPen( radialGrid.majorPen );

        drawCircles( painter, canvasRect, pole, radialMap,
            radialGrid.scaleDiv.ticks( QwtScaleDiv::MajorTick ) );
    }

    // draw azimuth grid

    const GridData& azimuthGrid =
        m_data->gridData[QwtPolar::Azimuth];

    if ( azimuthGrid.isVisible && azimuthGrid.isMinorVisible )
    {
        painter->setPen( azimuthGrid.minorPen );

        drawRays( painter, canvasRect, pole, radius, azimuthMap,
            azimuthGrid.scaleDiv.ticks( QwtScaleDiv::MinorTick ) );
        drawRays( painter, canvasRect, pole, radius, azimuthMap,
            azimuthGrid.scaleDiv.ticks( QwtScaleDiv::MediumTick ) );
    }
    if ( azimuthGrid.isVisible )
    {
        painter->setPen( azimuthGrid.majorPen );

        drawRays( painter, canvasRect, pole, radius, azimuthMap,
            azimuthGrid.scaleDiv.ticks( QwtScaleDiv::MajorTick ) );
    }
    painter->restore();

    for ( int axisId = 0; axisId < QwtPolar::AxesCount; axisId++ )
    {
        const AxisData& axis = m_data->axisData[axisId];
        if ( axis.isVisible )
        {
            painter->save();
            drawAxis( painter, axisId );
            painter->restore();
        }
    }
}

void QwtPolarGrid::drawRays(
    QPainter* painter, const QRectF& canvasRect,
    const QPointF& pole, double radius,
    const QwtScaleMap& azimuthMap, const QList< double >& values ) const
{
    for ( int i = 0; i < int( values.size() ); i++ )
    {
        double azimuth = azimuthMap.transform( values[i] );
        azimuth = ::fmod( azimuth, 2 * M_PI );

        bool skipLine = false;
        if ( testDisplayFlag( SmartScaleDraw ) )
        {
            const QwtAbstractScaleDraw::ScaleComponent bone =
                QwtAbstractScaleDraw::Backbone;
            if ( isClose( azimuth, 0.0 ) )
            {
                const AxisData& axis = m_data->axisData[QwtPolar::AxisRight];
                if ( axis.isVisible && axis.scaleDraw->hasComponent( bone ) )
                    skipLine = true;
            }
            else if ( isClose( azimuth, M_PI / 2 ) )
            {
                const AxisData& axis = m_data->axisData[QwtPolar::AxisTop];
                if ( axis.isVisible && axis.scaleDraw->hasComponent( bone ) )
                    skipLine = true;
            }
            else if ( isClose( azimuth, M_PI ) )
            {
                const AxisData& axis = m_data->axisData[QwtPolar::AxisLeft];
                if ( axis.isVisible && axis.scaleDraw->hasComponent( bone ) )
                    skipLine = true;
            }
            else if ( isClose( azimuth, 3 * M_PI / 2.0 ) )
            {
                const AxisData& axis = m_data->axisData[QwtPolar::AxisBottom];
                if ( axis.isVisible && axis.scaleDraw->hasComponent( bone ) )
                    skipLine = true;
            }
        }
        if ( !skipLine )
        {
            const QPointF pos = qwtPolar2Pos( pole, radius, azimuth );

            /*
                Qt4 is horrible slow, when painting primitives,
                with coordinates far outside the visible area.
             */

            QPolygonF polygon( 2 );
            polygon[0] = pole.toPoint();
            polygon[1] = pos.toPoint();

            if ( testDisplayFlag( ClipGridLines ) )
                QwtClipper::clipPolygonF( canvasRect, polygon );

            QwtPainter::drawPolyline( painter, polygon );
        }
    }
}

void QwtPolarGrid::drawCircles(
    QPainter* painter, const QRectF& canvasRect,
    const QPointF& pole, const QwtScaleMap& radialMap,
    const QList< double >& values ) const
{
    for ( int i = 0; i < int( values.size() ); i++ )
    {
        const double val = values[i];

        const GridData& gridData =
            m_data->gridData[QwtPolar::Radius];

        bool skipLine = false;
        if ( testDisplayFlag( SmartScaleDraw ) )
        {
            const AxisData& axis = m_data->axisData[QwtPolar::AxisAzimuth];
            if ( axis.isVisible &&
                axis.scaleDraw->hasComponent( QwtAbstractScaleDraw::Backbone ) )
            {
                if ( isClose( val, gridData.scaleDiv.upperBound() ) )
                    skipLine = true;
            }
        }

        if ( isClose( val, gridData.scaleDiv.lowerBound() ) )
            skipLine = true;

        if ( !skipLine )
        {
            const double radius = radialMap.transform( val );

            QRectF outerRect( 0, 0, 2 * radius, 2 * radius );
            outerRect.moveCenter( pole );

            if ( testDisplayFlag( ClipGridLines ) )
            {
                /*
                    Qt4 is horrible slow, when painting primitives,
                    with coordinates far outside the visible area.
                    We need to clip.
                 */

                const QVector< QwtInterval > angles =
                    QwtClipper::clipCircle( canvasRect, pole, radius );

                for ( int j = 0; j < angles.size(); j++ )
                {
                    const QwtInterval intv = angles[j];

                    if ( intv.minValue() == 0 && intv.maxValue() == 2 * M_PI )
                    {
                        QwtPainter::drawEllipse( painter, outerRect );
                    }
                    else
                    {
                        const double from = qwtDegrees( intv.minValue() );
                        const double to = qwtDegrees( intv.maxValue() );

                        double span = to - from;
                        if ( span < 0.0 )
                            span += 360.0;

                        painter->drawArc( outerRect,
                            qRound( from * 16 ), qRound( span * 16 ) );
                    }
                }
            }
            else
            {
                QwtPainter::drawEllipse( painter, outerRect );
            }
        }
    }
}

void QwtPolarGrid::drawAxis( QPainter* painter, int axisId ) const
{
    if ( axisId < 0 || axisId >= QwtPolar::AxesCount )
        return;

    AxisData& axis = m_data->axisData[axisId];

    painter->setPen( axis.pen );
    painter->setFont( axis.font );

    QPalette pal;
    pal.setColor( QPalette::WindowText, axis.pen.color() );
    pal.setColor( QPalette::Text, axis.pen.color() );

    axis.scaleDraw->draw( painter, pal );
}

void QwtPolarGrid::updateScaleDraws(
    const QwtScaleMap& azimuthMap, const QwtScaleMap& radialMap,
    const QPointF& pole, double radius ) const
{
    const QPoint p = pole.toPoint();

    const QwtInterval interval =
        m_data->gridData[QwtPolar::ScaleRadius].scaleDiv.interval();

    const int min = radialMap.transform( interval.minValue() );
    const int max = radialMap.transform( interval.maxValue() );
    const int l = max - min;

    for ( int axisId = 0; axisId < QwtPolar::AxesCount; axisId++ )
    {
        AxisData& axis = m_data->axisData[axisId];

        if ( axisId == QwtPolar::AxisAzimuth )
        {
            QwtRoundScaleDraw* scaleDraw =
                static_cast< QwtRoundScaleDraw* >( axis.scaleDraw );

            scaleDraw->setRadius( qRound( radius ) );
            scaleDraw->moveCenter( p );

            double from = ::fmod( 90.0 - qwtDegrees( azimuthMap.p1() ), 360.0 );
            if ( from < 0.0 )
                from += 360.0;

            scaleDraw->setAngleRange( from, from - 360.0 );

            const QwtTransform* transform = azimuthMap.transformation();
            if ( transform )
                scaleDraw->setTransformation( transform->copy() );
            else
                scaleDraw->setTransformation( NULL );
        }
        else
        {
            QwtScaleDraw* scaleDraw =
                static_cast< QwtScaleDraw* >( axis.scaleDraw );

            switch( axisId )
            {
                case QwtPolar::AxisLeft:
                {
                    scaleDraw->move( p.x() - min, p.y() );
                    scaleDraw->setLength( -l );
                    break;
                }
                case QwtPolar::AxisRight:
                {
                    scaleDraw->move( p.x() + min, p.y() );
                    scaleDraw->setLength( l );
                    break;
                }
                case QwtPolar::AxisTop:
                {
                    scaleDraw->move( p.x(), p.y() - max );
                    scaleDraw->setLength( l );
                    break;
                }
                case QwtPolar::AxisBottom:
                {
                    scaleDraw->move( p.x(), p.y() + max );
                    scaleDraw->setLength( -l );
                    break;
                }
            }
            const QwtTransform* transform = radialMap.transformation();
            if ( transform )
                scaleDraw->setTransformation( transform->copy() );
            else
                scaleDraw->setTransformation( NULL );
        }
    }
}

void QwtPolarGrid::updateScaleDiv( const QwtScaleDiv& azimuthScaleDiv,
    const QwtScaleDiv& radialScaleDiv, const QwtInterval& interval )
{
    GridData& radialGrid = m_data->gridData[QwtPolar::Radius];

    const QwtPolarPlot* plt = plot();
    if ( plt && testGridAttribute( AutoScaling ) )
    {
        const QwtScaleEngine* se = plt->scaleEngine( QwtPolar::Radius );
        radialGrid.scaleDiv = se->divideScale(
            interval.minValue(), interval.maxValue(),
            plt->scaleMaxMajor( QwtPolar::Radius ),
            plt->scaleMaxMinor( QwtPolar::Radius ), 0 );
    }
    else
    {
        if ( radialGrid.scaleDiv != radialScaleDiv )
            radialGrid.scaleDiv = radialScaleDiv;
    }

    GridData& azimuthGrid = m_data->gridData[QwtPolar::Azimuth];
    if ( azimuthGrid.scaleDiv != azimuthScaleDiv )
    {
        azimuthGrid.scaleDiv = azimuthScaleDiv;
    }

    bool hasOrigin = false;
    for ( int axisId = 0; axisId < QwtPolar::AxesCount; axisId++ )
    {
        AxisData& axis = m_data->axisData[axisId];
        if ( axis.isVisible && axis.scaleDraw )
        {
            if ( axisId == QwtPolar::AxisAzimuth )
            {
                axis.scaleDraw->setScaleDiv( azimuthGrid.scaleDiv );
                if ( testDisplayFlag( SmartScaleDraw ) )
                {
                    axis.scaleDraw->enableComponent(
                        QwtAbstractScaleDraw::Ticks, !azimuthGrid.isVisible );
                }
            }
            else
            {
                QwtScaleDiv sd = radialGrid.scaleDiv;

                QList< double > ticks = sd.ticks( QwtScaleDiv::MajorTick );

                if ( testDisplayFlag( SmartOriginLabel ) )
                {
                    bool skipOrigin = hasOrigin;
                    if ( !skipOrigin )
                    {
                        if ( axisId == QwtPolar::AxisLeft
                            || axisId == QwtPolar::AxisRight )
                        {
                            if ( m_data->axisData[QwtPolar::AxisBottom].isVisible )
                                skipOrigin = true;
                        }
                        else
                        {
                            if ( m_data->axisData[QwtPolar::AxisLeft].isVisible )
                                skipOrigin = true;
                        }
                    }
                    if ( ticks.size() > 0 && ticks.first() == sd.lowerBound() )
                    {
                        if ( skipOrigin )
                            ticks.removeFirst();
                        else
                            hasOrigin = true;
                    }
                }

                if ( testDisplayFlag( HideMaxRadiusLabel ) )
                {
                    if ( ticks.size() > 0 && ticks.last() == sd.upperBound() )
                        ticks.removeLast();
                }

                sd.setTicks( QwtScaleDiv::MajorTick, ticks );
                axis.scaleDraw->setScaleDiv( sd );

                if ( testDisplayFlag( SmartScaleDraw ) )
                {
                    axis.scaleDraw->enableComponent(
                        QwtAbstractScaleDraw::Ticks, !radialGrid.isVisible );
                }

            }
        }
    }
}

int QwtPolarGrid::marginHint() const
{
    const AxisData& axis = m_data->axisData[QwtPolar::AxisAzimuth];
    if ( axis.isVisible )
    {
        const int extent = axis.scaleDraw->extent( axis.font );
        return extent;
    }

    return 0;
}

const QwtScaleDraw* QwtPolarGrid::scaleDraw( int axisId ) const
{
    if ( axisId >= QwtPolar::AxisLeft && axisId <= QwtPolar::AxisBottom )
        return static_cast< QwtScaleDraw* >( m_data->axisData[axisId].scaleDraw );

    return NULL;
}

QwtScaleDraw* QwtPolarGrid::scaleDraw( int axisId )
{
    if ( axisId >= QwtPolar::AxisLeft && axisId <= QwtPolar::AxisBottom )
        return static_cast< QwtScaleDraw* >( m_data->axisData[axisId].scaleDraw );

    return NULL;
}

void QwtPolarGrid::setScaleDraw( int axisId, QwtScaleDraw* scaleDraw )
{
    if ( axisId < QwtPolar::AxisLeft || axisId > QwtPolar::AxisBottom )
        return;

    AxisData& axisData = m_data->axisData[axisId];
    if ( axisData.scaleDraw != scaleDraw )
    {
        delete axisData.scaleDraw;
        axisData.scaleDraw = scaleDraw;
        itemChanged();
    }
}

const QwtRoundScaleDraw* QwtPolarGrid::azimuthScaleDraw() const
{
    return static_cast< QwtRoundScaleDraw* >(
        m_data->axisData[QwtPolar::AxisAzimuth].scaleDraw );
}

QwtRoundScaleDraw* QwtPolarGrid::azimuthScaleDraw()
{
    return static_cast< QwtRoundScaleDraw* >(
        m_data->axisData[QwtPolar::AxisAzimuth].scaleDraw );
}

void QwtPolarGrid::setAzimuthScaleDraw( QwtRoundScaleDraw* scaleDraw )
{
    AxisData& axisData = m_data->axisData[QwtPolar::AxisAzimuth];
    if ( axisData.scaleDraw != scaleDraw )
    {
        delete axisData.scaleDraw;
        axisData.scaleDraw = scaleDraw;
        itemChanged();
    }
}